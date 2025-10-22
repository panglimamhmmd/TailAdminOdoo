// No import from page.tsx, biar gak error
// --------------------------------------

interface PaymentStatusGroup {
  status: string;
  total_amount: number;
  invoice_count: number;
}

interface JournalGroup {
  journal_id: number;
  journal_name: string;
  summary_by_status: PaymentStatusGroup[];
  total_amount: number;
  invoice_count: number;
}

interface InvoiceSummary {
  journals: JournalGroup[];
  grand_total: number;
  total_invoices: number;
}

interface ProjectDetail {
  id: number;
  name: string;
  x_studio_related_field_180_1j3l9t4is?: string; // nilai kontrak
}

interface DetailedProject {
  project: ProjectDetail | null;
  invoice_summary: InvoiceSummary;
}

// -------------------- CORE FUNCTIONS --------------------

export function formatCurrency(value: number): string {
  if (!value || isNaN(value)) return "Rp0";
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

interface AggregatedStatus {
  paid: number;
  unpaid: number;
  paidCount: number;
  unpaidCount: number;
}

export function aggregateStatus(journalList: JournalGroup[]): AggregatedStatus {
  const result: AggregatedStatus = { paid: 0, unpaid: 0, paidCount: 0, unpaidCount: 0 };

  journalList.forEach((j) => {
    j.summary_by_status.forEach((s) => {
      const st = s.status.toLowerCase();
      const total = s.total_amount || 0;
      const count = s.invoice_count || 0;

      if (st.includes("paid") && !st.includes("unpaid")) {
        result.paid += total;
        result.paidCount += count;
      } else if (st.includes("unpaid") || st.includes("draft") || st.includes("to_pay")) {
        result.unpaid += total;
        result.unpaidCount += count;
      } else if (!st.includes("paid")) {
        result.unpaid += total;
        result.unpaidCount += count;
      }
    });
  });

  return result;
}

export function computeFinanceSummary(project: DetailedProject) {
  const journals = project.invoice_summary?.journals || [];
  const invoiceJournals = journals.filter((j) => /invoice/i.test(j.journal_name));
  const costJournals = journals.filter((j) => !/invoice/i.test(j.journal_name));

  const totalInvoices = invoiceJournals.reduce((sum, j) => sum + (j.total_amount || 0), 0);
  const totalCosts = costJournals.reduce((sum, j) => sum + (j.total_amount || 0), 0);
  const net = totalInvoices - totalCosts;

  const invoiceAgg = aggregateStatus(invoiceJournals);
  const costAgg = aggregateStatus(costJournals);

  const totalContract = Number(project.project?.x_studio_related_field_180_1j3l9t4is) || 0;
  const totalRAP = totalContract * 0.2;

  const budgetBurnRate = totalRAP > 0 ? (totalCosts / totalRAP) * 100 : 0;
  const variancePct = totalRAP > 0 ? ((totalRAP - totalCosts) / totalRAP) * 100 : 0;
  const profitMargin = totalInvoices - totalCosts;
  const efficiencyScore = totalContract > 0 ? (profitMargin / totalContract) * 100 : 0;

  return {
    totalInvoices,
    totalCosts,
    net,
    invoiceAgg,
    costAgg,
    totalContract,
    totalRAP,
    budgetBurnRate,
    variancePct,
    profitMargin,
    efficiencyScore,
  };
}

export function formatKPI(value: number, suffix = "%"): string {
  if (isNaN(value)) return "-";
  return `${value.toFixed(1)}${suffix}`;
}
