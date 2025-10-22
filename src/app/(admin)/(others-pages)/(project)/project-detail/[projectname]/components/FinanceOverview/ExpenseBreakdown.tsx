// components/FinanceOverview/ExpenseBreakdown.tsx
import React from "react";
import type { FinanceSummary } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { EXPENSE_CATEGORIES } from "../../utils/constant";

interface ExpenseBreakdownProps {
  summary: FinanceSummary;
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({
  summary,
}) => {
  return (
    <div className="rounded-md bg-white dark:bg-gray-900 border p-4 lg:col-span-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Expense Breakdown
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Top spend / categories
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Simple Pie Chart Placeholder */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-36 h-36 relative">
            <svg viewBox="0 0 36 36" className="w-36 h-36">
              <circle
                cx="18"
                cy="18"
                r="10"
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="18"
                cy="18"
                r="10"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="6"
                strokeDasharray="25 75"
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
              <circle
                cx="18"
                cy="18"
                r="10"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeDasharray="20 80"
                strokeLinecap="round"
                transform="rotate(-20 18 18)"
              />
              <circle
                cx="18"
                cy="18"
                r="10"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="6"
                strokeDasharray="15 85"
                strokeLinecap="round"
                transform="rotate(60 18 18)"
              />
            </svg>
          </div>
        </div>

        {/* Top Vendors & Categories */}
        <div className="md:col-span-2 col-span-1">
          {/* Top Vendors */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Top 3 Vendor Spend</div>
            {summary.topVendors.length === 0 ? (
              <div className="text-xs text-gray-500">
                No vendor breakdown available
              </div>
            ) : (
              summary.topVendors.map((vendor, idx) => (
                <div key={vendor.name} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {idx + 1}. {vendor.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((vendor.amount / Math.max(1, summary.totalCosts)) * 100).toFixed(1)}% of costs
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(vendor.amount)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Expense Categories */}
          <div className="mt-4">
            <div className="text-xs text-gray-500">Expense categories (proxy)</div>
            <div className="mt-2 space-y-2">
              {EXPENSE_CATEGORIES.map((category) => (
                <div key={category.label}>
                  <div className="flex items-center justify-between text-xs">
                    <div>{category.label}</div>
                    <div>{category.pct}%</div>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gray-800 dark:bg-gray-300"
                      style={{ width: `${category.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Sparkline */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Income vs Outcome (Last points)
          </div>
          <div className="text-xs text-gray-500">Toggle: per subproject</div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          {/* Sparkline */}
          <div className="flex-1">
            <svg viewBox="0 0 120 40" className="w-full h-10">
              {/* Income line (green) */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                points={summary.monthlyTrend
                  .map(
                    (point, idx) =>
                      `${idx * 20 + 5},${
                        30 -
                        Math.min(
                          30,
                          (point.income / Math.max(1, summary.totalInvoices)) * 30
                        )
                      }`
                  )
                  .join(" ")}
              />
              {/* Outcome line (red) */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                points={summary.monthlyTrend
                  .map(
                    (point, idx) =>
                      `${idx * 20 + 5},${
                        30 -
                        Math.min(
                          30,
                          (point.outcome / Math.max(1, summary.totalCosts)) * 30
                        )
                      }`
                  )
                  .join(" ")}
              />
            </svg>
          </div>

          <div className="w-40 text-xs text-gray-500">
            <div>Income (green): {formatCurrency(summary.invoicePaid)}</div>
            <div>Outcome (red): {formatCurrency(summary.costPaid)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseBreakdown;