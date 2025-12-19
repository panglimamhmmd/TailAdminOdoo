import React from "react";
import StatCard from "./StatCard";
import { BoxIconLine, GroupIcon } from "@/icons"; // Using existing icons or accessible ones

export default function ProjectOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <StatCard
          title="Active Projects"
          value="12"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          change={{ value: "2 new", trend: "up" }}
        />
        <StatCard
          title="Completed"
          value="45"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          change={{ value: "5 this month", trend: "up" }}
        />
        <StatCard
          title="Pipeline"
          value="8"
          icon={<GroupIcon className="text-gray-800 dark:text-white/90" />} // Placeholder icon
          subtitle="Upcoming projects"
        />
        <StatCard
          title="Avg Progress"
          value="68%"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="Across active projects"
        />
      </div>

      {/* Critical Projects */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Critical Projects (Attention Required)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-100 uppercase dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Project Name</th>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Issue</th>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Deadline</th>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4 font-medium text-gray-800 dark:text-white">Jakarta Tower A</td>
                <td className="px-4 py-4 text-red-500">Over Budget (15%)</td>
                <td className="px-4 py-4">Oct 24, 2025</td>
                <td className="px-4 py-4"><span className="inline-block rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">Critical</span></td>
              </tr>
               <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4 font-medium text-gray-800 dark:text-white">Sby Mall Renovation</td>
                <td className="px-4 py-4 text-orange-500">Supplier Delay</td>
                <td className="px-4 py-4">Nov 01, 2025</td>
                 <td className="px-4 py-4"><span className="inline-block rounded bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-300">Warning</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
