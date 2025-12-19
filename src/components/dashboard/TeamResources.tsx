"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function TeamResources() {
  const utilizationOptions: ApexOptions = {
    chart: {
      type: 'radialBar',
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
         dataLabels: {
          name: {
             offsetY: -10,
             color: "#888",
             fontSize: "13px"
          },
          value: {
             offsetY: 5,
             color: "#111",
             fontSize: "24px",
             show: true,
             formatter: function (val) {
                return val + "%";
             }
          }
        }
      },
    },
    labels: ['Utilization'],
    colors: ['#3C50E0'],
  };

  const utilizationSeries = [78];

  const distributionOptions: ApexOptions = {
    chart: { type: 'bar' , fontFamily: "Outfit, sans-serif", toolbar: { show: false }},
    colors: ['#10B981'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    xaxis: { categories: ['Design', 'Procurement', 'Construction', 'Admin', 'Sales'] },
  };

  const distributionSeries = [{ name: 'Workload', data: [80, 90, 60, 40, 50] }];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Team Utilization
        </h3>
        <ReactApexChart options={utilizationOptions} series={utilizationSeries} type="radialBar" height={350} />
      </div>

       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Workload Distribution
        </h3>
        <ReactApexChart options={distributionOptions} series={distributionSeries} type="bar" height={350} />
      </div>
    </div>
  );
}
