import React from "react";
import StatCard from "./StatCard";
import { BoxIconLine } from "@/icons";

export default function ProcurementMaterials() {
  return (
    <div className="space-y-6">
       <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Procurement & Materials</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <StatCard
          title="PO Status"
          value="95% On-time"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />} 
          change={{ value: "5 Orders Delayed", trend: "down" }}
        />
        <StatCard
          title="Supplier Rating"
          value="4.8/5.0"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="Average performance"
        />
        <StatCard
          title="Low Inventory"
          value="3 Items"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          change={{ value: "Reorder Needed", trend: "down" }}
        />
      </div>
      
       <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Key Materials Inventory
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-100 uppercase dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Material</th>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Stock Level</th>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Status</th>
                <th className="px-4 py-3 font-medium text-gray-800 dark:text-white">Last Order</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4 font-medium text-gray-800 dark:text-white">Cement (Tons)</td>
                <td className="px-4 py-4">500</td>
                <td className="px-4 py-4"><span className="text-green-500">Good</span></td>
                <td className="px-4 py-4">2 days ago</td>
              </tr>
               <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4 font-medium text-gray-800 dark:text-white">Steel Rebar</td>
                <td className="px-4 py-4">120</td>
                <td className="px-4 py-4"><span className="text-orange-500">Low</span></td>
                 <td className="px-4 py-4">1 week ago</td>
              </tr>
               <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4 font-medium text-gray-800 dark:text-white">Bricks</td>
                <td className="px-4 py-4">10,000</td>
                <td className="px-4 py-4"><span className="text-green-500">Good</span></td>
                 <td className="px-4 py-4">3 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
