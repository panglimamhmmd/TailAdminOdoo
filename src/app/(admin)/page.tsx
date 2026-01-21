import type { Metadata } from "next";
import React from "react";
import ProjectOverview from "@/components/dashboard/ProjectOverview";
import FinancialSnapshot from "@/components/dashboard/FinancialSnapshot";
import RiskAlerts from "@/components/dashboard/RiskAlerts";

export const metadata: Metadata = {
  title:
    "Erbe Studio Dashboard",
  description: "Admin dashboard for Erbe Studio",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Row 1: Project Overview (KPIs & Critical Projects) */}
      <ProjectOverview />

       {/* Row 2: Financials & Risks */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <FinancialSnapshot />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <RiskAlerts />
        </div>
      </div>
    </div>
  );
}
