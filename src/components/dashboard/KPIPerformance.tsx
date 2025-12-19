"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function KPIPerformance() {
   const options: ApexOptions = {
    chart: { type: 'line', fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    stroke: { curve: 'smooth' },
    colors: ['#3C50E0', '#10B981'],
    xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
  };

  const series = [
    { name: 'Project Margin', data: [15, 18, 20, 22] },
    { name: 'Client Satisfaction', data: [85, 88, 90, 92] }
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Company KPIs Trend
      </h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}
