"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import StatCard from "./StatCard";
import { BoxIconLine } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function FinancialSnapshot() {
  const chartOptions: ApexOptions = {
    chart: {
        fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 300,
      toolbar: { show: false },
    },
    colors: ["#3C50E0", "#80CAEE"],
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
       categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
       axisBorder: { show: false },
       axisTicks: { show: false },
    },
     grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const chartSeries = [
    { name: "Revenue", data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 100, 140, 150] },
    { name: "Target", data: [40, 50, 45, 60, 55, 70, 80, 100, 110, 120, 130, 160] },
  ];

  return (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Financial Snapshot</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <StatCard
          title="Monthly Revenue"
          value="$150K"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          change={{ value: "12% vs Target", trend: "up" }}
        />
        <StatCard
          title="Outstanding Invoices"
          value="$24K"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="5 Clients pending"
        />
         <StatCard
          title="Payables"
          value="$12K"
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="Vendor bills due"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Revenue vs Target
        </h4>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
