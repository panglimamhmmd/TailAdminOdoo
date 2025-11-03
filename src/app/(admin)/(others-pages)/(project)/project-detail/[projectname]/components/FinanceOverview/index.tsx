// components/FinanceOverview/index.tsx
import React from "react";
import type { DetailedProject } from "../../types";
import { computeFinanceSummary } from "../../utils/financeCalculations";
import { KPICards } from "./KPICards";
import { ProgressHealthRow } from "./ProgressHealthRow";
import { CashFlowSnapshot } from "./CashFlowSnapshot";
import { ExpenseBreakdown } from "./ExpenseBreakdown";

interface FinanceOverviewProps {
  project?: DetailedProject;
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({ project }) => {
  const summary = computeFinanceSummary(project);

  return (
    <div className="rounded-2xl p-5 border mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Finance Overview
          </h3>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
            Executive summary - key financial KPIs
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards summary={summary} />

      {/* Progress & Health */}
      <ProgressHealthRow summary={summary} project={project} />

      {/* Cash Flow & Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <CashFlowSnapshot summary={summary} />
        <ExpenseBreakdown summary={summary} />
      </div>
    </div>
  );
};

export default FinanceOverview;