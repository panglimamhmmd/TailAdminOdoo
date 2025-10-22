// components/FinanceOverview/ProgressHealthRow.tsx
import React from "react";
import type { FinanceSummary, DetailedProject } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { getTrafficLight } from "../../utils/financeCalculations";

interface ProgressHealthRowProps {
  summary: FinanceSummary;
  project?: DetailedProject;
}

export const ProgressHealthRow: React.FC<ProgressHealthRowProps> = ({
  summary,
  project,
}) => {
  const trafficLight = getTrafficLight(summary.healthIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* Overall Progress */}
      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Overall Project Progress
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {project?.project?.x_progress_project ?? 0}%
          </div>
        </div>
        <div className="mt-2 h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-700"
            style={{ width: `${project?.project?.x_progress_project ?? 0}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Average across subproject
        </div>
      </div>

      {/* Profit Margin */}
      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Projected Profit Margin
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {summary.profitMargin >= 0 ? "Positive" : "Negative"}
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg font-semibold">
            {formatCurrency(summary.profitMargin)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Invoices - Costs
          </div>
        </div>
      </div>

      {/* Health Index */}
      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Financial Health Index
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {summary.healthIndex.toFixed(1)}%
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(0, Math.min(100, summary.healthIndex))}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              (Paid Income - Paid Outcome) / RAB
            </div>
          </div>
          <div>
            <span className={`px-2 py-1 rounded-md ${trafficLight.color}`}>
              {trafficLight.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHealthRow;