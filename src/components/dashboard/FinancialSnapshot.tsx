"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import StatCard from "./StatCard";
import { useDashboardData } from "@/hooks/useDashboardData";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FinancialSnapshot() {
  const { stats, loading } = useDashboardData();

  const [view, setView] = React.useState<'overview' | 'cashflow'>('overview');

  if (loading || !stats) {
     return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;
  }

  // --- Chart Data Preparation ---
  let chartSeries: ApexAxisChartSeries = [];
  let chartCategories: string[] = [];
  let chartColors: string[] = [];

  if (view === 'overview') {
     chartSeries = [
       { name: "Total Revenue", data: [stats.totalRevenue] },
       { name: "Total Expenses", data: [stats.totalExpenses] },
     ];
     chartCategories = ['Current Financials'];
     chartColors = ["#10B981", "#EF4444"];
  } else {
     // Cash Flow Forecast (Weekly Buckets)
     const getWeek = (date: Date) => {
        const d = new Date(date);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(),0,1);
        const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `W${weekNo}`;
     };
     
     // Group by Week
     const weeklyCash = new Map<string, { in: number, out: number }>();
     
     // Helper to process items
     const processItems = (items: { date: string, amount: number }[], type: 'in' | 'out') => {
        items.forEach(item => {
           if (!item.date) return;
           const date = new Date(item.date);
           const week = getWeek(date);
           const current = weeklyCash.get(week) || { in: 0, out: 0 };
           if (type === 'in') current.in += item.amount;
           else current.out += item.amount;
           weeklyCash.set(week, current);
        });
     };

     if (stats.cashFlow) {
        processItems(stats.cashFlow.incoming, 'in');
        processItems(stats.cashFlow.outgoing, 'out');
     }

     // Sort weeks
     const sortedWeeks = Array.from(weeklyCash.keys()).sort();
     chartCategories = sortedWeeks;
     chartSeries = [
        { name: "Cash In", data: sortedWeeks.map(w => weeklyCash.get(w)?.in || 0) },
        { name: "Cash Out", data: sortedWeeks.map(w => weeklyCash.get(w)?.out || 0) }
     ];
     chartColors = ["#10B981", "#EF4444"];
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 320,
      toolbar: { show: false },
      fontFamily: 'Outfit, sans-serif',
      stacked: false, // Side by side for cash flow
    },
    colors: chartColors,
    plotOptions: {
       bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
          borderRadiusApplication: 'end',
       },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ['transparent'] },
    xaxis: {
       categories: chartCategories,
       axisBorder: { show: false },
       axisTicks: { show: false },
       labels: {
         style: { colors: '#9ca3af', fontSize: '12px', fontWeight: 500 }
       }
    },
    yaxis: {
       labels: {
         formatter: (val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}M` : `${val}`,
         style: { colors: '#9ca3af', fontSize: '12px' }
       }
    },
    grid: {
      borderColor: '#f3f4f6', 
      strokeDashArray: 4,
      yaxis: { lines: { show: true } }
    },
    tooltip: {
       theme: "light",
       y: { formatter: (val) => formatRupiah(val) },
       style: { fontSize: '12px' }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Financial Snapshot</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your project finances</p>
         </div>
         <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start sm:self-center">
            <button
               onClick={() => setView('overview')}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === 'overview' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
               }`}
            >
               Overview
            </button>
            <button
               onClick={() => setView('cashflow')}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === 'cashflow' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
               }`}
            >
               Cash Flow Forecast
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <StatCard
          title="Total Revenue"
          value={formatRupiah(stats.totalRevenue)}
          icon={<svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          change={{ value: "Accumulated confirmed", trend: "up" }}
        />
        <StatCard
          title="Outstanding Invoices"
          value={formatRupiah(stats.outstandingInvoices)}
          icon={<svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          subtitle="Unpaid customer invoices"
        />
         <StatCard
          title="Vendor Payables"
          value={formatRupiah(stats.vendorPayables)}
          icon={<svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          subtitle="Bills to be paid"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm">
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {view === 'overview' ? 'Revenue vs Expenses' : 'Cash Flow Forecast (Next Weeks)'}
        </h4>
        <div id="chartOne" className="-ml-2">
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar" 
            height={320}
          />
        </div>
      </div>
    </div>
  );
}
