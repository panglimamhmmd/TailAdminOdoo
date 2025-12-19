import React from "react";

export default function RiskAlerts() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Risk & Alerts
      </h3>
      <ul className="space-y-3">
         <li className="flex items-start justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
           <div>
              <p className="font-medium text-red-600 dark:text-red-400">Budget Overrun Risk</p>
              <p className="text-sm text-gray-500">Jakarta Tower A projected to exceed by 15%</p>
           </div>
           <span className="text-xs text-gray-400">2 hrs ago</span>
        </li>
         <li className="flex items-start justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
           <div>
              <p className="font-medium text-orange-600 dark:text-orange-400">Upcoming Deadline</p>
              <p className="text-sm text-gray-500">Sby Mall Renovation Phase 1 due in 2 days</p>
           </div>
           <span className="text-xs text-gray-400">5 hrs ago</span>
        </li>
        <li className="flex items-start justify-between">
           <div>
              <p className="font-medium text-blue-600 dark:text-blue-400">New Issue Reported</p>
              <p className="text-sm text-gray-500">Delay in Cement delivery for Project X</p>
           </div>
           <span className="text-xs text-gray-400">1 day ago</span>
        </li>
      </ul>
    </div>
  );
}
