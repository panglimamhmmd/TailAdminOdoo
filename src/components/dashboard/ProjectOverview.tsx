"use client";
import React from "react";
import StatCard from "./StatCard";
import Badge from "@/components/ui/badge/Badge";
import { BoxIconLine, GroupIcon } from "@/icons"; 
import { useDashboardData } from "@/hooks/useDashboardData";

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProjectOverview() {
  const { stats, projects, loading } = useDashboardData();

  if (loading || !stats) {
     return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;
  }

  // Identify Critical Projects (Over budget or Critical Stage)
  const criticalProjects = projects.filter(p => {
     const totalExpenses = 
        (p.vendorBills?.paid.amount || 0) + (p.vendorBills?.unpaid.amount || 0) + 
        (p.pekerja?.paid.amount || 0) + (p.pekerja?.unpaid.amount || 0) +
        (p.pelaksana?.paid.amount || 0) + (p.pelaksana?.unpaid.amount || 0);

     const totalLiability = totalExpenses + (p.committedCosts || 0);
     
     const isOverBudget = p.RAB > 0 && totalLiability > p.RAB;
     const isCriticalStage = p.stage === 'Critical';
     
     return isOverBudget || isCriticalStage || (totalLiability > p.RAB * 0.9); // Warning at 90%
  }).slice(0, 5); // Top 5

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <StatCard
          title="Active Projects"
          value={stats.inProgressProjects.toString()}
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          change={{ value: `${stats.completedProjects} Completed`, trend: "up" }}
        />
        <StatCard
          title="Avg Progress"
          value={`${stats.avgProgress}%`}
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="Across active projects"
        />
        <StatCard
          title="Total Budget"
          value={formatRupiah(projects.reduce((sum, p) => sum + p.RAB, 0))}
          icon={<GroupIcon className="text-gray-800 dark:text-white/90" />} 
          subtitle="Active RAB Value"
        />
        <StatCard
          title="Committed Costs"
          value={formatRupiah(stats.committedCosts)}
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          subtitle="Confirmed POs (Not Invoiced)"
          change={{ value: "Future Liability", trend: "up" }}
        />
      </div>

      {/* Critical Projects */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Critical Projects (Attention Required)
        </h3>
        <div className="grid gap-4 sm:grid-cols-1">
          {criticalProjects.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 dark:bg-green-500/10 dark:text-green-400 mb-3">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium">All Projects Healthy</h3>
                <p className="text-gray-500 text-sm mt-1">No critical budget issues found.</p>
             </div>
          ) : (
            criticalProjects.map((p, idx) => {
               const totalExpenses = Object.values(p.vendorBills || {}).reduce((a,b) => a+b.amount,0) + 
                                Object.values(p.pekerja || {}).reduce((a,b) => a+b.amount,0) + 
                                Object.values(p.pelaksana || {}).reduce((a,b) => a+b.amount,0);
               const committed = p.committedCosts || 0;
               const totalLiability = totalExpenses + committed;

               const isOver = totalLiability > p.RAB;
               const percentage = p.RAB > 0 ? (totalLiability / p.RAB) * 100 : 0;
               const expensePercentage = p.RAB > 0 ? (totalExpenses / p.RAB) * 100 : 0;

               return (
                <div key={idx} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:border-brand-100 dark:border-gray-800 dark:bg-gray-800/20 dark:hover:bg-gray-800 dark:text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Icon & Info */}
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 ${isOver ? 'text-red-500' : 'text-orange-500'}`}>
                         {isOver ? (
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                         ) : (
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {p.projectName}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">
                            {formatRupiah(totalLiability)}
                          </span>
                          <span>/</span>
                          <span>{formatRupiah(p.RAB)} RAB</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stats & Action */}
                    <div className="flex items-center gap-3 self-start sm:self-center ml-14 sm:ml-0">
                       <div className="text-right">
                          <div className={`text-sm font-bold ${isOver ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                             {percentage.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-gray-400">Consumed + Committed</div>
                       </div>
                       
                       <Badge color={isOver ? 'error' : 'warning'} className="px-2.5 py-1">
                          {isOver ? 'Over Budget' : 'High Risk'}
                       </Badge>

                        <a href={`/projectdetail/${encodeURIComponent(p.projectName)}`} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                  </div>
                  
                  {/* Progress Bar Visual */}
                  <div className="mt-3 ml-14 sm:ml-0 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden flex">
                     {/* Actual Expense */}
                     <div 
                        className={`h-full ${isOver ? 'bg-red-500' : 'bg-orange-500'}`} 
                        style={{ width: `${Math.min(expensePercentage, 100)}%` }} 
                     />
                     {/* Committed Cost (Lighter) */}
                     <div 
                        className={`h-full ${isOver ? 'bg-red-300' : 'bg-orange-300'}`} 
                        style={{ width: `${Math.min(percentage - expensePercentage, 100 - expensePercentage)}%` }} 
                     />
                  </div>
                </div>
               );
            })
          )}
        </div>
      </div>
    </div>
  );
}
