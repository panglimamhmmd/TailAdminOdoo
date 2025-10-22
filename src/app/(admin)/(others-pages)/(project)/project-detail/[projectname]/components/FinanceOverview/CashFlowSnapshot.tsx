// components/FinanceOverview/CashFlowSnapshot.tsx
import React from "react";
import type { FinanceSummary } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface CashFlowSnapshotProps {
  summary: FinanceSummary;
}

export const CashFlowSnapshot: React.FC<CashFlowSnapshotProps> = ({
  summary,
}) => {
  const netCashPosition = summary.invoicePaid - summary.costPaid;

  return (
    <div className="rounded-md bg-white dark:bg-gray-900 border p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Cash Flow Snapshot
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">Quick</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Cash In */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-xs text-gray-500">Total Cash In</div>
          <div className="text-lg font-semibold text-green-600 mt-1">
            {formatCurrency(summary.invoicePaid)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.invoicePaidCount} invoice(s)
          </div>
        </div>

        {/* Cash Out */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-xs text-gray-500">Total Cash Out</div>
          <div className="text-lg font-semibold text-red-600 mt-1">
            {formatCurrency(summary.costPaid)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.costPaidCount} bill(s)
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-xs text-gray-500">Outstanding Invoices</div>
          <div className="text-lg font-semibold text-yellow-600 mt-1">
            {formatCurrency(summary.invoiceUnpaid)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.invoiceUnpaidCount} inv
          </div>
        </div>

        {/* Outstanding Bills */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-xs text-gray-500">Outstanding Vendor Bills</div>
          <div className="text-lg font-semibold text-red-500 mt-1">
            {formatCurrency(summary.costUnpaid)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.costUnpaidCount} bill(s)
          </div>
        </div>
      </div>

      {/* Net Position */}
      <div className="mt-4">
        <div className="text-xs text-gray-500">Net Cash Position</div>
        <div
          className={`text-lg font-semibold mt-1 ${
            netCashPosition >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(netCashPosition)}
        </div>
      </div>
    </div>
  );
};

export default CashFlowSnapshot;