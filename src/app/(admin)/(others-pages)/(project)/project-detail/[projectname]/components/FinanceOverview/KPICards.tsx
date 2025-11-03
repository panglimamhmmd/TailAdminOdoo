// components/FinanceOverview/KPICards.tsx
import React from "react";
import type { FinanceSummary } from "../../types";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface KPICardsProps {
  summary: FinanceSummary;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {/* Total Contract */}
      <div className="p-4 rounded-lg bg-green dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="text-md text-gray-500 dark:text-gray-400">
          Contract Value (RAB)
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.totalContract)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Baseline (RAB)
            </div>
          </div>
          <div className="text-sm px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/10 text-blue-600">
            RAP: {formatCurrency(summary.totalRAP)}
          </div>
        </div>
      </div>

      {/* Total Realization */}
      <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="text-md text-gray-500 dark:text-gray-400">
          💸 Total Realization (Project Cost)
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-xl font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalCosts)}
            </div>
            {/* <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Realized cost (all cost journals)
            </div> */}
          </div>
          {/* <div className="text-sm px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/10 text-red-600">
            Realized
          </div> */}
        </div>
      </div>

      {/* Variance */}
      <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="text-md text-gray-500 dark:text-gray-400">
          ⚖️ Variance (vs RAP)
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div
              className={`text-xl font-semibold ${
                summary.variancePct >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatPercentage(summary.variancePct)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Variance = (RAP - Realized)/RAP
            </div>
          </div>
          <div
            className={`text-xl px-2 py-1 rounded-md ${
              summary.budgetBurnRate > 100
                ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
                : "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400"
            }`}
          >
            Burn{" "}
            {summary.budgetBurnRate > 0
              ? `${summary.budgetBurnRate.toFixed(0)}%`
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};


export default KPICards;