import React from "react";
import StatCard from "./StatCard";
import { GroupIcon, BoxIconLine } from "@/icons";

export default function SalesMarketing() {
  return (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Sales & Marketing</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <StatCard
          title="New Leads"
          value="45"
          icon={<GroupIcon className="text-gray-800 dark:text-white/90" />}
          change={{ value: "+15% vs Last Month", trend: "up" }}
        />
        <StatCard
          title="Conversion Rate"
          value="12%"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="Proposal to Contract"
        />
        <StatCard
          title="Win Rate"
          value="60%"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="Contracts Won"
        />
      </div>
    </div>
  );
}
