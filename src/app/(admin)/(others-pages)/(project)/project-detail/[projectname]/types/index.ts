// types/index.ts
export interface PaymentStatusGroup {
  status: string;
  total_amount: number;
  invoice_count: number;
}

export interface JournalGroup {
  journal_id: number;
  journal_name: string;
  summary_by_status: PaymentStatusGroup[];
  total_amount: number;
  invoice_count: number;
}

export interface InvoiceSummary {
  journals: JournalGroup[];
  grand_total: number;
  total_invoices: number;
}

export interface ProjectTask {
  id: number;
  name: string;
  stage_id?: [number, string];
  date_deadline?: string;
  priority?: string;
  x_studio_persentase?: number;
}

export interface ProjectDetail {
  id: number;
  name: string;
  stage_id?: [number, string];
  user_id?: [number, string];
  partner_id?: [number, string];
  date_start?: string;
  date?: string;
  tag_ids?: number[];
  x_studio_related_field_180_1j3l9t4is?: string; // RAP / RAB
  x_progress_project?: number;
}

export interface DetailedProject {
  project: ProjectDetail | null;
  invoice_summary: InvoiceSummary;
  tasks: ProjectTask[];
  invoices_count: number;
  tasks_count: number;
}

export type TabType = "design" | "construction" | "interior";

export interface GroupedProjects {
  design?: DetailedProject;
  construction?: DetailedProject;
  interior?: DetailedProject;
}

export interface FinanceSummary {
  totalInvoices: number;
  totalCosts: number;
  net: number;
  invoicePaid: number;
  invoiceUnpaid: number;
  invoicePaidCount: number;
  invoiceUnpaidCount: number;
  costPaid: number;
  costUnpaid: number;
  costPaidCount: number;
  costUnpaidCount: number;
  totalContract: number;
  totalRAP: number;
  budgetBurnRate: number;
  variancePct: number;
  profitMargin: number;
  efficiencyScore: number;
  healthIndex: number;
  topVendors: { name: string; amount: number }[];
  monthlyTrend: { month: string; income: number; outcome: number }[];
}

export interface VendorSpend {
  name: string;
  amount: number;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  outcome: number;
}