// utils/financeCalculations.ts
import type { JournalGroup, DetailedProject, FinanceSummary } from "../types";

// Safe numeric parser
export const safeNum = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.-]/g, "");
    if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === "object" && v !== null && "valueOf" in v) {
    const rawValue = (v as { valueOf: () => unknown }).valueOf();
    if (typeof rawValue === "number") return Number.isFinite(rawValue) ? rawValue : 0;
    if (typeof rawValue === "string") {
      const cleaned = rawValue.replace(/[^\d.-]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
  }
  return 0;
};

interface StatusAggregation {
  paid: number;
  unpaid: number;
  paidCount: number;
  unpaidCount: number;
}

export const aggregateStatus = (journalList: JournalGroup[]): StatusAggregation => {
  const result: StatusAggregation = {
    paid: 0,
    unpaid: 0,
    paidCount: 0,
    unpaidCount: 0,
  };

  journalList.forEach((journal) => {
    (journal.summary_by_status || []).forEach((statusGroup) => {
      const status = String(statusGroup.status || "").toLowerCase();
      const total = safeNum(statusGroup.total_amount);
      const count = safeNum(statusGroup.invoice_count);

      if (status.includes("paid") && !status.includes("unpaid")) {
        result.paid += total;
        result.paidCount += count;
      } else if (
        status.includes("unpaid") ||
        status.includes("draft") ||
        status.includes("to_pay")
      ) {
        result.unpaid += total;
        result.unpaidCount += count;
      } else {
        if (!status.includes("paid")) {
          result.unpaid += total;
          result.unpaidCount += count;
        }
      }
    });
  });

  return result;
};

export const computeFinanceSummary = (
  project?: DetailedProject
): FinanceSummary => {
  if (!project) {
    return {
      totalInvoices: 0,
      totalCosts: 0,
      net: 0,
      invoicePaid: 0,
      invoiceUnpaid: 0,
      invoicePaidCount: 0,
      invoiceUnpaidCount: 0,
      costPaid: 0,
      costUnpaid: 0,
      costPaidCount: 0,
      costUnpaidCount: 0,
      totalContract: 0,
      totalRAP: 0,
      budgetBurnRate: 0,
      variancePct: 0,
      profitMargin: 0,
      efficiencyScore: 0,
      healthIndex: 0,
      topVendors: [],
      monthlyTrend: [],
    };
  }

  const journals = project.invoice_summary?.journals || [];
  const invoiceJournals = journals.filter((j) => /invoice/i.test(j.journal_name));
  const costJournals = journals.filter((j) => !/invoice/i.test(j.journal_name));

  const totalInvoices = invoiceJournals.reduce((sum, j) => sum + safeNum(j.total_amount), 0);
  const totalCosts = costJournals.reduce((sum, j) => sum + safeNum(j.total_amount), 0);
  const net = totalInvoices - totalCosts;

  const invoiceAgg = aggregateStatus(invoiceJournals);
  const costAgg = aggregateStatus(costJournals);

  // RAP / RAB parsing
  const totalContract = safeNum(project.project?.x_studio_related_field_180_1j3l9t4is);
  const totalRAP = Math.round(totalContract * 0.2);

  const budgetBurnRate = totalRAP > 0 ? (totalCosts / totalRAP) * 100 : 0;
  const variancePct = totalRAP > 0 ? ((totalRAP - totalCosts) / totalRAP) * 100 : 0;
  const profitMargin = totalInvoices - totalCosts;
  const efficiencyScore = totalContract > 0 ? (profitMargin / totalContract) * 100 : 0;
  const healthIndex = totalContract > 0 ? ((invoiceAgg.paid - costAgg.paid) / totalContract) * 100 : 0;

  // Top vendors
  const topVendors = [...costJournals]
    .sort((a, b) => safeNum(b.total_amount) - safeNum(a.total_amount))
    .slice(0, 3)
    .map((j) => ({ name: j.journal_name, amount: safeNum(j.total_amount) }));

  // Monthly trend (simplified)
  const monthlyTrend = (() => {
    const items = [...invoiceJournals, ...costJournals]
      .slice(-6)
      .map((j, idx) => ({
        month: `M${idx + 1}`,
        income: /invoice/i.test(j.journal_name) ? safeNum(j.total_amount) : 0,
        outcome: /invoice/i.test(j.journal_name) ? 0 : safeNum(j.total_amount),
      }));
    while (items.length < 6) {
      items.unshift({ month: `M${items.length + 1}`, income: 0, outcome: 0 });
    }
    return items;
  })();

  return {
    totalInvoices,
    totalCosts,
    net,
    invoicePaid: invoiceAgg.paid,
    invoiceUnpaid: invoiceAgg.unpaid,
    invoicePaidCount: invoiceAgg.paidCount,
    invoiceUnpaidCount: invoiceAgg.unpaidCount,
    costPaid: costAgg.paid,
    costUnpaid: costAgg.unpaid,
    costPaidCount: costAgg.paidCount,
    costUnpaidCount: costAgg.unpaidCount,
    totalContract,
    totalRAP,
    budgetBurnRate,
    variancePct,
    profitMargin,
    efficiencyScore,
    healthIndex,
    topVendors,
    monthlyTrend,
  };
};

export const getTrafficLight = (pct: number) => {
  if (pct > 15)
    return {
      label: "Healthy",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  if (pct >= 5)
    return {
      label: "Warning",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  return {
    label: "Critical",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
};