import type { Metadata } from "next";
import React from "react";
import ProjectOverview from "@/components/dashboard/ProjectOverview";
import FinancialSnapshot from "@/components/dashboard/FinancialSnapshot";
import TeamResources from "@/components/dashboard/TeamResources";
import ProcurementMaterials from "@/components/dashboard/ProcurementMaterials";
import SalesMarketing from "@/components/dashboard/SalesMarketing";
import RiskAlerts from "@/components/dashboard/RiskAlerts";
import KPIPerformance from "@/components/dashboard/KPIPerformance";

export const metadata: Metadata = {
  title:
    "Erbe Studio Dashboard",
  description: "Admin dashboard for Erbe Studio",
};

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Row 1: Project Overview */}
      <div className="col-span-12">
        <ProjectOverview />
      </div>

       {/* Row 2: Financial Snapshot */}
      <div className="col-span-12">
        <FinancialSnapshot />
      </div>

      {/* Row 3: Team & Resources + Risk Sidebar */}
      <div className="col-span-12 xl:col-span-8">
        <TeamResources />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <RiskAlerts />
      </div>

      {/* Row 4: Procurement */}
       <div className="col-span-12">
        <ProcurementMaterials />
      </div>

      {/* Row 5: Sales & KPI */}
      <div className="col-span-12 xl:col-span-6">
        <SalesMarketing />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <KPIPerformance />
      </div>
    </div>
  );
}
