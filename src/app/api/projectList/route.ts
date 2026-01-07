import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ======================
// Types
// ======================

interface OdooProject {
  id: number;
  name: string;
  tag_ids: number[];
  x_progress_project: number;
  date_start: string | false;
  date: string | false;
  stage_id: [number, string] | false;
  x_studio_person_in_charge_pic?: [number, string][]; // Many2many usually returns array of [id, name] tuples in search_read if configured, or just ids. Let's assume standard behavior or request behavior.
  // Actually standard search_read for M2M returns IDs array [1, 2] usually.
  // But if we want names, we might need to fetch ‘res.users’ or depend on context.
  // Let's assume it returns IDs first, and we might need to fetch names if not provided.
  // WAIT: User said "name of the fields is x_studio_person_in_charge_pic".
  // If we assume it behaves like standard M2M in search_read, it returns [id1, id2]. 
  // Exception: if valid read (not search_read), it might differ. But search_read usually just IDs.
  // Let's try to fetch it first.
}

interface OdooTask {
  id: number;
  name: string;
  project_id: [number, string]; // [id, name]
  stage_id: [number, string]; // [id, name]
  date_deadline: string | false;
  x_studio_persentase?: number;
  sequence: number;
  create_date: string;
}

interface OdooResponse<T> {
  result?: T;
  error?: {
    data?: {
      message: string;
    };
  };
}

interface SubProject {
  id: number;
  code: string;
  division: string;
  progress: number;
  deadline: string | false;
  start_date: string | false;
  stage: string;
  pic: string[]; // List of PIC names
  nextTask?: {
    name: string;
    deadline: string | false;
    percentage: number;
  } | null;
}

interface GroupedProject {
  main_project: string;
  sub_projects: SubProject[];
}

interface TransformedProject {
  name: string;
  progressDesign: number;
  progressConstruction: number;
  progressInterior: number;
  deadlineDesign: string | false;
  deadlineConstruction: string | false;
  deadlineInterior: string | false;
  startDateDesign?: string | false;
  startDateConstruction?: string | false;
  startDateInterior?: string | false;
  hasDesign: boolean;
  hasConstruction: boolean;
  hasInterior: boolean;
  statusDesign: string;
  statusConstruction: string;
  statusInterior: string;
  // New fields for Design (or others)
  picDesign: string[];
  picConstruction: string[];
  picInterior: string[];
  nextTaskDesign: { name: string; deadline: string | false } | null;
  nextTaskConstruction: { name: string; deadline: string | false } | null;
  nextTaskInterior: { name: string; deadline: string | false } | null;
}

// ======================
// Route Handler
// ======================

export async function GET() {
  try {
    const { apiKey, database, url } = odooConfig;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // 1. Fetch Projects
    const projectsBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          database,
          2,
          apiKey,
          'project.project',
          'search_read',
          [
            [['stage_id', '!=', 4], ['name', '!=', 'Internal']]
          ],
          {
            fields: ['id', 'name', 'tag_ids', 'x_progress_project', 'date_start', 'date', 'stage_id', 'x_studio_person_in_charge_pic'],
            limit: 50,
            order: 'create_date asc'
          }
        ]
      },
      id: 1
    };

    // 2. Fetch Tasks (Optimized: we could filter by project_ids if we had them, but for now we fetch recent tasks or all relevant)
    // To be safe and efficient, we should wait for projects first, get their IDs, then fetch tasks.
    
    const projectRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectsBody),
      cache: 'no-store'
    });

    if (!projectRes.ok) throw new Error(`HTTP error! status: ${projectRes.status}`);
    const projectData: OdooResponse<OdooProject[]> = await projectRes.json();
    
    if (projectData.error) {
      return NextResponse.json({ error: projectData.error.data?.message || 'Odoo API error' }, { status: 400 });
    }

    const projects = projectData.result || [];
    const projectIds = projects.map(p => p.id);

    // 2. Fetch Tasks for these Projects
    // We need: name, deadline, stage, percentage, project_id, sequence
    const tasksBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          database,
          2,
          apiKey,
          'project.task',
          'search_read',
          [
            [['project_id', 'in', projectIds], ['stage_id.name', 'not in', ['Done', 'Cancelled']]] // Filter early
          ],
          {
            fields: ['id', 'name', 'project_id', 'stage_id', 'date_deadline', 'x_studio_persentase', 'sequence', 'create_date'],
            // Sort by Deadline ASC, then Sequence ASC, then ID
            order: 'date_deadline asc, sequence asc, id asc'
          }
        ]
      },
      id: 2
    };

    // 3. Fetch Users (for PIC names) if x_studio... returns IDs
    // Since we don't know the IDs yet, we might need to fetch all users or look them up.
    // Optimization: Check if projects have usage of this field.
    // Assumption: Odoo M2M search_read often returns just IDs. We need a way to map ID -> Name.
    // Let's fetch 'res.users' or 'res.partner' (depending on what PIC points to, likely res.users).
    // Let's assume it points to res.users.
    
    const tasksRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasksBody),
      cache: 'no-store'
    });
    const tasksData: OdooResponse<OdooTask[]> = await tasksRes.json();
    const tasks = tasksData.result || [];

    // Collect all PIC IDs
    const allPicIds = new Set<number>();
    projects.forEach(p => {
       // Odoo M2M in search_read is usually just array of IDs: [1, 5]
       // Casting to unknown first to avoid TS errors if definition differs
       const pics = (p.x_studio_person_in_charge_pic as unknown as number[]) || [];
       if (Array.isArray(pics)) {
         pics.forEach(id => typeof id === 'number' && allPicIds.add(id));
       }
    });

    // Fetch Names for these IDs
    const userMap: Record<number, string> = {};
    if (allPicIds.size > 0) {
      const usersBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            database,
            2,
            apiKey,
            'hr.employee', // Switch to hr.employee based on user feedback ("employee user") and failure of res.users
            'search_read',
            [
              [['id', 'in', Array.from(allPicIds)]]
            ],
            {
               fields: ['id', 'name']
            }
          ]
        },
        id: 3
      };
      
      const usersRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usersBody),
        cache: 'no-store'
      });
      const usersData: OdooResponse<{id: number, name: string}[]> = await usersRes.json();
      const users = usersData.result || [];
      users.forEach(u => userMap[u.id] = u.name);
    }

    // ======================
    // Logic: Next Task Helper
    // ======================
    const getNextTask = (projId: number) => {
      // Tasks are already sorted by Deadline > Sequence.
      // Filter for this project
      // Filter for Persentase < 100
      const projTasks = tasks.filter(t => t.project_id[0] === projId);
      
      const next = projTasks.find(t => {
        const pct = t.x_studio_persentase || 0;
        return pct < 100;
      });
      
      return next ? {
        name: next.name,
        deadline: next.date_deadline,
        percentage: next.x_studio_persentase || 0
      } : null;
    };

    const getPicNames = (p: OdooProject) => {
       const ids = (p.x_studio_person_in_charge_pic as unknown as number[]) || [];
       if (!Array.isArray(ids)) return [];
       return ids.map(id => userMap[id] || `Employee ${id}`);
    };

    // ======================
    // Map Tag ID ke Division
    // ======================
    const tagMap: Record<number, string> = {
      1: 'Construction',
      2: 'Interior',
      3: 'Design'
    };

    // ======================
    // Grouping
    // ======================
    const grouped = projects.reduce<Record<string, GroupedProject>>((acc, item) => {
      const parts = item.name?.split(' - ') ?? [];
      const code = parts[0] || 'Unknown';
      const mainName = (parts[1]?.replace(' (copy)', '').trim()) || item.name || 'Untitled';

      if (!acc[mainName]) {
        acc[mainName] = {
          main_project: mainName,
          sub_projects: []
        };
      }

      acc[mainName].sub_projects.push({
        id: item.id,
        code,
        division: tagMap[item.tag_ids?.[0]] || 'Unknown',
        progress: item.x_progress_project ?? 0,
        deadline: item.date,
        start_date: item.date_start,
        stage: Array.isArray(item.stage_id) ? item.stage_id[1] : 'Unknown',
        pic: getPicNames(item),
        nextTask: getNextTask(item.id)
      });

      return acc;
    }, {});

    const result: GroupedProject[] = Object.values(grouped);

    // ======================
    // Transformasi Data
    // ======================
    const transformProjectData = (projects: GroupedProject[]): TransformedProject[] => {
      return projects.map((project) => {
        const designProject = project.sub_projects.find((sub) => sub.division === 'Design');
        const constructionProject = project.sub_projects.find((sub) => sub.division === 'Construction');
        const interiorProject = project.sub_projects.find((sub) => sub.division === 'Interior');

        return {
          name: project.main_project,
          // Design
          progressDesign: designProject ? Math.round(designProject.progress * 100) : 0,
          deadlineDesign: designProject?.deadline || false,
          startDateDesign: designProject?.start_date,
          hasDesign: !!designProject,
          statusDesign: designProject?.stage || 'Unknown',
          picDesign: designProject?.pic || [],
          nextTaskDesign: designProject?.nextTask || null,
          
          // Construction
          progressConstruction: constructionProject ? Math.round(constructionProject.progress * 100) : 0,
          deadlineConstruction: constructionProject?.deadline || false,
          startDateConstruction: constructionProject?.start_date,
          hasConstruction: !!constructionProject,
          statusConstruction: constructionProject?.stage || 'Unknown',
          picConstruction: constructionProject?.pic || [],
          nextTaskConstruction: constructionProject?.nextTask || null,

          // Interior
          progressInterior: interiorProject ? Math.round(interiorProject.progress * 100) : 0,
          deadlineInterior: interiorProject?.deadline || false,
          startDateInterior: interiorProject?.start_date,
          hasInterior: !!interiorProject,
          statusInterior: interiorProject?.stage || 'Unknown',
          picInterior: interiorProject?.pic || [],
          nextTaskInterior: interiorProject?.nextTask || null,
        };
      });
    };

    const transformed = transformProjectData(result);

    return NextResponse.json({
      success: true,
      projects: transformed
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects from Odoo' },
      { status: 500 }
    );
  }
}
