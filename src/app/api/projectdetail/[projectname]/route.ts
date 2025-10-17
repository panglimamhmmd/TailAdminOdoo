import { NextResponse } from "next/server";

// Types
interface OdooResponse {
  jsonrpc: string;
  id: number;
  result?: unknown;
  error?: {
    data: {
      message: string;
    };
  };
}

interface ProjectBasic {
  id: number;
  name?: string;
}

interface ProjectDetail {
  id: number;
  name: string;
  stage_id?: [number, string];
  user_id?: [number, string];
  partner_id?: [number, string];
  date_start?: string;
  date?: string;
  tag_ids?: [number, string][];
}

interface AccountMove {
  id: number;
  name: string;
  amount_total?: number;
  state?: string;
  invoice_date?: string;
  partner_id?: [number, string];
  payment_state?: string;
  journal_id?: [number, string];
}

interface ProjectTask {
  id: number;
  name: string;
  stage_id?: [number, string];
  user_ids?: number[];
  date_deadline?: string;
  priority?: string;
}

interface PaymentStatusGroup {
  status: string;
  total_amount: number;
  invoice_count: number;
}

interface PartnerGroup {
  partner_id: number;
  partner_name: string;
  payment_statuses: PaymentStatusGroup[];
  total_amount: number;
  invoice_count: number;
}

interface JournalGroup {
  journal_id: number;
  journal_name: string;
  partners: PartnerGroup[];
  summary_by_status: PaymentStatusGroup[];
  total_amount: number;
  invoice_count: number;
}

interface InvoiceSummary {
  journals: JournalGroup[];
  grand_total: number;
  total_invoices: number;
}

interface DetailedProject {
  project: ProjectDetail | null;
  invoices: AccountMove[];
  invoice_summary: InvoiceSummary;
  tasks: ProjectTask[];
  invoices_count: number;
  tasks_count: number;
  error?: string;
}

// Helper function untuk fetch data dari Odoo
async function fetchOdooData<T>(
  model: string,
  domain: unknown[],
  fields: string[]
): Promise<T[]> {
  const apiKey = process.env.ODOO_API_KEY_PROD;
  if (!apiKey) {
    throw new Error("ODOO_API_KEY is not configured");
  }
  const response = await fetch("https://erbe.odoo.com/jsonrpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "erbe",
          2,
          apiKey,
          model,
          "search_read",
          [domain],
          {
            fields: fields,
            limit: 100
          }
        ]
      },
      id: 1
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as OdooResponse;

  if (data.error) {
    throw new Error(data.error.data.message || "Odoo API error");
  }

  return data.result as T[];
}

// Function untuk grouping dan aggregation invoices
function groupAndSummarizeInvoices(invoices: AccountMove[]): InvoiceSummary {
  const journalMap = new Map<number, JournalGroup>();

  invoices.forEach((invoice) => {
    const journalId = invoice.journal_id?.[0] || 0;
    const journalName = invoice.journal_id?.[1] || "Unknown Journal";
    const partnerId = invoice.partner_id?.[0] || 0;
    const partnerName = invoice.partner_id?.[1] || "Unknown Partner";
    const amount = invoice.amount_total || 0;
    
    // Tentukan status pembayaran
    let paymentStatus = "unpaid";
    if (invoice.payment_state === "paid" || invoice.state === "paid") {
      paymentStatus = "paid";
    } else if (invoice.state === "cancel") {
      paymentStatus = "cancelled";
    } else if (invoice.payment_state === "in_payment") {
      paymentStatus = "in_payment";
    } else if (invoice.payment_state === "partial") {
      paymentStatus = "partial";
    }

    // Get or create journal group
    if (!journalMap.has(journalId)) {
      journalMap.set(journalId, {
        journal_id: journalId,
        journal_name: journalName,
        partners: [],
        summary_by_status: [],
        total_amount: 0,
        invoice_count: 0
      });
    }

    const journalGroup = journalMap.get(journalId)!;
    
    // Find or create partner group
    let partnerGroup = journalGroup.partners.find(p => p.partner_id === partnerId);
    if (!partnerGroup) {
      partnerGroup = {
        partner_id: partnerId,
        partner_name: partnerName,
        payment_statuses: [],
        total_amount: 0,
        invoice_count: 0
      };
      journalGroup.partners.push(partnerGroup);
    }

    // Find or create payment status group
    let statusGroup = partnerGroup.payment_statuses.find(s => s.status === paymentStatus);
    if (!statusGroup) {
      statusGroup = {
        status: paymentStatus,
        total_amount: 0,
        invoice_count: 0
      };
      partnerGroup.payment_statuses.push(statusGroup);
    }

    // Update amounts and counts
    statusGroup.total_amount += amount;
    statusGroup.invoice_count += 1;
    partnerGroup.total_amount += amount;
    partnerGroup.invoice_count += 1;
    journalGroup.total_amount += amount;
    journalGroup.invoice_count += 1;

    // Update journal summary by status
    let journalStatusGroup = journalGroup.summary_by_status.find(s => s.status === paymentStatus);
    if (!journalStatusGroup) {
      journalStatusGroup = {
        status: paymentStatus,
        total_amount: 0,
        invoice_count: 0
      };
      journalGroup.summary_by_status.push(journalStatusGroup);
    }
    journalStatusGroup.total_amount += amount;
    journalStatusGroup.invoice_count += 1;
  });

  const journals = Array.from(journalMap.values());
  const grandTotal = journals.reduce((sum, j) => sum + j.total_amount, 0);
  const totalInvoices = journals.reduce((sum, j) => sum + j.invoice_count, 0);

  return {
    journals,
    grand_total: grandTotal,
    total_invoices: totalInvoices
  };
}

export async function GET(
  request: Request,
  { params }: { params: { projectname: string } }
) {
  const { projectname } = params;

  // Decode URL parameter (untuk handle spasi dan karakter khusus)
  const decodedProjectName = decodeURIComponent(projectname);

  try {
    // Fetch data dari Odoo API
    const response = await fetch("https://erbe.odoo.com/jsonrpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            "erbe",
            2,
            "cde052ee9e348b4db3f4372fb016c0bcad3947e0",
            "project.project",
            "search_read",
            [
              [["name", "ilike", decodedProjectName]]
            ],
            {
              fields: ["id"],
              limit: 10
            }
          ]
        },
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as OdooResponse;

    // Check jika ada error dari Odoo
    if (data.error) {
      return NextResponse.json(
        { error: data.error.data.message || "Odoo API error" },
        { status: 500 }
      );
    }

    // Ambil result dari response
    const projects = data.result as ProjectBasic[];

    // Check jika tidak ada project ditemukan
    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Nested fetch untuk setiap project ID
    const detailedProjects: DetailedProject[] = await Promise.all(
      projects.map(async (project) => {
        const projectId = project.id;

        try {
          // Fetch project.project detail
          const projectDetail = await fetchOdooData<ProjectDetail>(
            "project.project",
            [["id", "=", projectId]],
            ["id", "name", "stage_id", "user_id", "partner_id", "date_start", "date" , "tag_ids"]
          );

          // Fetch account.move (invoices)
          const accountMoves = await fetchOdooData<AccountMove>(
            "account.move",
            [["x_studio_project_name_1", "=", projectId]],
            ["id", "name", "amount_total", "state", "invoice_date", "partner_id", "payment_state", "journal_id"]
          );

          // Fetch project.task
          const projectTasks = await fetchOdooData<ProjectTask>(
            "project.task",
            [["project_id", "=", projectId]],
            ["id", "name", "stage_id", "user_ids", "date_deadline", "priority"]
          );

          // Create invoice summary
          const invoiceSummary = groupAndSummarizeInvoices(accountMoves);

          return {
            project: projectDetail[0] || null,
            invoices: accountMoves || [],
            invoice_summary: invoiceSummary,
            tasks: projectTasks || [],
            invoices_count: accountMoves?.length || 0,
            tasks_count: projectTasks?.length || 0
          };
        } catch (err) {
          console.error(`Error fetching details for project ${projectId}:`, err);
          return {
            project: { id: projectId, name: project.name || "" },
            invoices: [],
            invoice_summary: {
              journals: [],
              grand_total: 0,
              total_invoices: 0
            },
            tasks: [],
            invoices_count: 0,
            tasks_count: 0,
            error: "Failed to fetch project details"
          };
        }
      })
    );

    // Return hasil pencarian dengan detail lengkap
    return NextResponse.json({
      success: true,
      count: projects.length,
      projects: detailedProjects
    });

  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch project data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}