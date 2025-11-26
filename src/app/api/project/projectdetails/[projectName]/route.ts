// app/api/projects/[projectName]/route.ts

import { NextResponse } from 'next/server';

// ============= TYPES =============
interface OdooProject {
  id: number;
  name: string;
  tag_ids: number[];
}

interface FinanceGroup {
  journal_id: [number, string];
  status_in_payment: string;
  amount_total: number;
  __count: number;
}

interface FinanceSummary {
  totalAmount: number;
  totalInvoices: number;
  byStatus: Record<string, number>;
  byJournal: Record<string, number>;
}

interface ProjectDetails {
  id: number;
  name: string;
  date_start?: string;
  date?: string;
  user_id?: [number, string];
  partner_id?: [number, string];
  tag_ids: number[];
  x_studio_related_field_180_1j3l9t4is?: number;
  x_progress_project?: number;
}

interface Task {
  id: number;
  name: string;
  x_studio_persentase?: number;
  x_studio_bobot?: number;
  x_studio_progress?: number;
}

interface Client {
  name: string;
}

interface SubProjectData {
  id: number;
  soCode: string;
  type: 'construction' | 'design' | 'interior' | 'other';
  fullName: string;
  details: ProjectDetails | null;
  finances: {
    groups: FinanceGroup[];
    summary: FinanceSummary;
  };
  tasks: Task[];
  client: Client | null;
}

interface OdooResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    data?: {
      message?: string;
    };
  };
}

// ============= HELPERS =============
function getProjectType(tagIds: number[]): 'construction' | 'design' | 'interior' | 'other' {
  if (tagIds.includes(1)) return 'construction';
  if (tagIds.includes(2)) return 'design';
  if (tagIds.includes(3)) return 'interior';
  return 'other';
}

function extractSOCode(fullName: string): string {
  const match = fullName.match(/^([A-Z0-9]+)\s*-/);
  return match ? match[1] : '';
}

// Aggregate finance data into summary
function aggregateFinances(groups: FinanceGroup[]): FinanceSummary {
  const summary: FinanceSummary = {
    totalAmount: 0,
    totalInvoices: 0,
    byStatus: {},
    byJournal: {},
  };

  groups.forEach(group => {
    summary.totalAmount += group.amount_total;
    summary.totalInvoices += group.__count;

    // Group by status
    const status = group.status_in_payment || 'unknown';
    summary.byStatus[status] = (summary.byStatus[status] || 0) + group.amount_total;

    // Group by journal
    const journalName = group.journal_id[1];
    summary.byJournal[journalName] = (summary.byJournal[journalName] || 0) + group.amount_total;
  });

  return summary;
}

// ============= ODOO API CALLS =============
const ODOO_URL = 'https://erbe.odoo.com';
const ODOO_DB = 'erbe';
const ODOO_UID = '2';
const ODOO_PASSWORD = process.env.ODOO_API_KEY_PROD


async function odooCall<T>(
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [ODOO_DB, ODOO_UID, ODOO_PASSWORD, model, method, args, kwargs],
      },
      id: Math.floor(Math.random() * 1000000),
    }),
  });

  if (!response.ok) {
    throw new Error(`Odoo API error: ${response.statusText}`);
  }

  const data: OdooResponse<T> = await response.json();
  
  if (data.error) {
    throw new Error(data.error.data?.message || 'Odoo API error');
  }

  if (!data.result) {
    throw new Error('No result from Odoo API');
  }

  return data.result;
}

// Search projects by name
async function searchProjectsByName(projectName: string): Promise<OdooProject[]> {
  return await odooCall<OdooProject[]>(
    'project.project',
    'search_read',
    [
      [['name', 'ilike', projectName], ['stage_id', '!=', 'Cancelled']]
    ],
    {
      fields: ['id', 'name', 'tag_ids'],
    }
  );
}

// Fetch project details
async function fetchProjectDetails(projectId: number): Promise<ProjectDetails | null> {
  const result = await odooCall<ProjectDetails[]>(
    'project.project',
    'search_read',
    [
      [['id', '=', projectId]]
    ],
    {
      fields: ['id', 'name', 'date_start', 'date', 'user_id', 'partner_id', 'tag_ids', 'x_studio_related_field_180_1j3l9t4is' , 'x_progress_project' ],
    }
  );
  return result[0] || null;
}

// Fetch finances using read_group (AGGREGATE)
async function fetchProjectFinances(projectId: number): Promise<{
  groups: FinanceGroup[];
  summary: FinanceSummary;
}> {
  const groups = await odooCall<FinanceGroup[]>(
    'account.move',
    'read_group',
    [
      [['x_studio_project_name_1', '=', projectId]]
    ],
    {
      fields: ['amount_total'],
      groupby: ['journal_id', 'status_in_payment'],
      lazy: false,
    }
  );

  return {
    groups,
    summary: aggregateFinances(groups),
  };
}

// Fetch tasks (SEARCH_READ)
async function fetchProjectTasks(projectId: number): Promise<Task[]> {
  return await odooCall<Task[]>(
    'project.task',
    'search_read',
    [
      [['project_id', '=', projectId]]
    ],
    {
      fields: ['id', 'name', 'x_studio_persentase', 'x_studio_bobot', 'x_studio_progress'],
    }
  );
}

// Fetch client details
async function fetchClientDetails(partnerId: number): Promise<Client | null> {
  const result = await odooCall<Client[]>(
    'res.partner',
    'search_read',
    [
      [['id', '=', partnerId]]
    ],
    {
      fields: ['name'],
    }
  );
  return result[0] || null;
}

// ============= MAIN API HANDLER =============
// export const revalidate = 300; // Cache 5 menit

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectName: string }> }
) {
  try {
    const { projectName } = await params;
    const decodedProjectName = decodeURIComponent(projectName);

    // console.log(`🔍 Fetching projects with name: ${projectName}`);

    // Step 1: Search all projects with this name
    const projects = await searchProjectsByName(decodedProjectName);

    if (projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', projectName },
        { status: 404 }
      );
    }


    // Step 2: Fetch all data for each sub-project in parallel
    const subProjectsData = await Promise.all(
      projects.map(async (project): Promise<SubProjectData> => {
        try {

          // Fetch project details first to get partner_id
          const details = await fetchProjectDetails(project.id);
          const partnerId = details?.partner_id?.[0]; // Odoo many2one returns [id, name]

          // Fetch all other data in parallel
          const [finances, tasks, client] = await Promise.all([
            fetchProjectFinances(project.id),
            fetchProjectTasks(project.id),
            partnerId ? fetchClientDetails(partnerId) : Promise.resolve(null),
          ]);

          // console.log(`✅ Successfully fetched data for ${project.name}`);
          // console.log(`   - Finances: ${finances.summary.totalInvoices} invoices, Total: ${finances.summary.totalAmount}`);
          // console.log(`   - Tasks: ${tasks.length} tasks`);
          // console.log(`   - Client: ${client?.name || 'N/A'}`);

          return {
            id: project.id,
            soCode: extractSOCode(project.name),
            type: getProjectType(project.tag_ids),
            fullName: project.name,
            details,
            finances,
            tasks,
            client,
          };
        } catch (error) {
          console.error(`❌ Error fetching data for project ${project.id}:`, error);
          
          // Return partial data if one sub-project fails
          return {
            id: project.id,
            soCode: extractSOCode(project.name),
            type: getProjectType(project.tag_ids),
            fullName: project.name,
            details: null,
            finances: {
              groups: [],
              summary: {
                totalAmount: 0,
                totalInvoices: 0,
                byStatus: {},
                byJournal: {},
              },
            },
            tasks: [],
            client: null,
          };
        }
      })
    );

    // Step 3: Sort by type priority (design -> construction -> interior)
    const typePriority: Record<string, number> = { 
      design: 1, 
      construction: 2, 
      interior: 3, 
      other: 4 
    };
    subProjectsData.sort((a, b) => typePriority[a.type] - typePriority[b.type]);

    // console.log(`🎉 Successfully processed ${subProjectsData.length} sub-projects`);

    return NextResponse.json({
      success: true,
      projectName,
      subProjects: subProjectsData,
      count: subProjectsData.length,
    });

  } catch (error) {
    console.error('❌ Error in project details API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}