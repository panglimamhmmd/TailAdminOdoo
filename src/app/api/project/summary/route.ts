import { NextResponse } from 'next/server';

// Types
interface OdooResponse<T> {
  jsonrpc: string;
  id: number;
  result: T[];
}

interface FinanceRecord {
  x_studio_project_name_1: [number, string] | false;
  journal_id: [number, string];
  status_in_payment: string;
  amount_total: number;
  __count: number;
}

interface ProjectRecord {
  name: string;
  tag_ids: [number, string];
  x_progress_project: number;
  x_studio_related_field_180_1j3l9t4is: number;
  __count: number;
}

interface PaymentStatus {
  paid: { amount: number; count: number };
  unpaid: { amount: number; count: number };
  partial: { amount: number; count: number };
  draft: { amount: number; count: number };
}

interface ProjectSummary {
  projectName: string;
  category: string;
  RAB: number;
  progress: number;
  invoice: PaymentStatus;
  vendorBills: PaymentStatus;
  pekerja: PaymentStatus;
  pelaksana: PaymentStatus;
}

// Constants
const JOURNAL_MAP: Record<number, string> = {
  8: 'invoice',
  9: 'vendorBills',
  16: 'pekerja',
  15: 'pelaksana',
};

const IGNORED_JOURNALS = [13, 10, 17, 18, 14, 19];

const TAG_MAP: Record<number, string> = {
  1: 'Construction',
  2: 'Interior',
  3: 'Design',
};

// Helper function to create empty payment status
const createEmptyPaymentStatus = (): PaymentStatus => ({
  paid: { amount: 0, count: 0 },
  unpaid: { amount: 0, count: 0 },
  partial: { amount: 0, count: 0 },
  draft: { amount: 0, count: 0 },
});

// Helper function to call Odoo API
async function callOdooApi<T>(payload): Promise<T[]> {
  const response = await fetch(`https://erbe.odoo.com/jsonrpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Openerp-Session-Id': process.env.ODOO_API_KEY_PROD || '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Odoo API error: ${response.statusText}`);
  }

  const data: OdooResponse<T> = await response.json();
  return data.result;
}

export async function GET() {
  try {
    // Call both APIs in parallel
    const [financeData, projectData] = await Promise.all([
      // Finance API
      callOdooApi<FinanceRecord>({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            'erbe',
            2,
            process.env.ODOO_API_KEY_PROD,
            'account.move',
            'read_group',
            [[['state', '!=', 'cancel']], ['amount_total'], ['x_studio_project_name_1', 'journal_id', 'status_in_payment']],
            { lazy: false },
          ],
        },
        id: 123,
      }),
      // Project API
      callOdooApi<ProjectRecord>({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            'erbe',
            2,
            process.env.ODOO_API_KEY_PROD,
            'project.project',
            'read_group',
            [
              [['stage_id.name', '!=', 'Cancelled'], ['name', '!=', 'Internal']],
              ['x_progress_project', 'x_studio_related_field_180_1j3l9t4is'],
              ['name', 'tag_ids'],
            ],
            { lazy: false },
          ],
        },
        id: 123,
      }),
    ]);

    // Group finance data by project
    const groupedFinance: Record<string, Record<string, PaymentStatus>> = {};
    const additionalInfo: Record<string, PaymentStatus> = {};

    for (const record of financeData) {
      const journalId = record.journal_id[0];
      const journalKey = JOURNAL_MAP[journalId];
      const status = record.status_in_payment;
      const amount = record.amount_total;
      const count = record.__count;

      // Check if journal should be ignored or if project is not assigned
      const isIgnoredJournal = IGNORED_JOURNALS.includes(journalId);
      const hasNoProject = !record.x_studio_project_name_1;

      if (isIgnoredJournal || hasNoProject) {
        // Add to additional information
        const key = journalKey || 'others';
        if (!additionalInfo[key]) {
          additionalInfo[key] = createEmptyPaymentStatus();
        }
        
        if (status === 'paid') {
          additionalInfo[key].paid.amount += amount;
          additionalInfo[key].paid.count += count;
        } else if (status === 'partial') {
          additionalInfo[key].partial.amount += amount;
          additionalInfo[key].partial.count += count;
        } else if (status === 'draft') {
          additionalInfo[key].draft.amount += amount;
          additionalInfo[key].draft.count += count;
        } else {
          additionalInfo[key].unpaid.amount += amount;
          additionalInfo[key].unpaid.count += count;
        }
        
        continue;
      }

      // Process regular project finance
      const projectName = record.x_studio_project_name_1[1];
      
      if (!journalKey) continue; // Skip if journal not in our map

      if (!groupedFinance[projectName]) {
        groupedFinance[projectName] = {};
      }

      if (!groupedFinance[projectName][journalKey]) {
        groupedFinance[projectName][journalKey] = createEmptyPaymentStatus();
      }

      // Add amount and count to appropriate status
      if (status === 'paid') {
        groupedFinance[projectName][journalKey].paid.amount += amount;
        groupedFinance[projectName][journalKey].paid.count += count;
      } else if (status === 'partial') {
        groupedFinance[projectName][journalKey].partial.amount += amount;
        groupedFinance[projectName][journalKey].partial.count += count;
      } else if (status === 'draft') {
        groupedFinance[projectName][journalKey].draft.amount += amount;
        groupedFinance[projectName][journalKey].draft.count += count;
      } else {
        groupedFinance[projectName][journalKey].unpaid.amount += amount;
        groupedFinance[projectName][journalKey].unpaid.count += count;
      }
    }

    // Build project summaries
    const projectSummaries: ProjectSummary[] = [];

    for (const project of projectData) {
      const projectName = project.name;
      const finance = groupedFinance[projectName] || {};
      const categoryId = project.tag_ids[0];

      const summary: ProjectSummary = {
        projectName,
        category: TAG_MAP[categoryId] || 'Unknown',
        RAB: project.x_studio_related_field_180_1j3l9t4is || 0,
        progress: Math.round((project.x_progress_project || 0) * 100),
        invoice: finance.invoice || createEmptyPaymentStatus(),
        vendorBills: finance.vendorBills || createEmptyPaymentStatus(),
        pekerja: finance.pekerja || createEmptyPaymentStatus(),
        pelaksana: finance.pelaksana || createEmptyPaymentStatus(),
      };

      projectSummaries.push(summary);
    }

    // Add additional information if exists
    if (Object.keys(additionalInfo).length > 0) {
      const additionalSummary: ProjectSummary = {
        projectName: 'Additional Information',
        category: 'Others',
        RAB: 0,
        progress: 0,
        invoice: additionalInfo.invoice || createEmptyPaymentStatus(),
        vendorBills: additionalInfo.vendorBills || createEmptyPaymentStatus(),
        pekerja: additionalInfo.pekerja || createEmptyPaymentStatus(),
        pelaksana: additionalInfo.pelaksana || createEmptyPaymentStatus(),
      };

      projectSummaries.push(additionalSummary);
    }

    return NextResponse.json({
      success: true,
      data: projectSummaries,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}