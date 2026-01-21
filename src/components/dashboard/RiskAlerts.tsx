"use client";
import React from "react";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function RiskAlerts() {
  const { projects, loading } = useDashboardData();

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;
  }

  // Generate Alerts
  // 1. Budget Alerts
  const budgetAlerts = projects
    .filter(p => {
       const totalExpenses = 
          (p.vendorBills?.paid.amount || 0) + (p.vendorBills?.unpaid.amount || 0) + 
          (p.pekerja?.paid.amount || 0) + (p.pekerja?.unpaid.amount || 0) +
          (p.pelaksana?.paid.amount || 0) + (p.pelaksana?.unpaid.amount || 0);
       return p.RAB > 0 && totalExpenses > (p.RAB * 0.9);
    })
    .map(p => {
        const totalExpenses = (p.vendorBills?.paid.amount || 0) + (p.vendorBills?.unpaid.amount || 0) + (p.vendorBills?.partial.amount || 0) + (p.pekerja?.paid.amount || 0) + (p.pelaksana?.paid.amount || 0);
        const ratio = (totalExpenses / p.RAB) * 100;
        return {
           type: 'budget',
           title: ratio > 100 ? 'Budget Overrun' : 'Near Budget Limit',
           message: `${p.projectName} is at ${ratio.toFixed(1)}% of budget.`,
           time: 'Action Required',
           color: ratio > 100 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
        };
    });

  // 2. Stage Alerts
  const stageAlerts = projects
    .filter(p => p.stage === 'Critical' || p.stage === 'On Hold')
    .map(p => ({
       type: 'stage',
       title: `Project ${p.stage}`,
       message: `${p.projectName} is currently marked as ${p.stage}.`,
       time: 'Just now',
       color: 'text-red-600 dark:text-red-400'
    }));

  const allAlerts = [...budgetAlerts, ...stageAlerts];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Risk & Alerts
      </h3>
      {allAlerts.length === 0 ? (
         <p className="text-gray-500 text-sm">No active risks detected.</p>
      ) : (
        <ul className="space-y-3">
           {allAlerts.map((alert, idx) => (
             <li key={idx} className="flex items-start justify-between border-b pb-2 border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
               <div>
                  <p className={`font-medium ${alert.color}`}>{alert.title}</p>
                  <p className="text-sm text-gray-500">{alert.message}</p>
               </div>
               <span className="text-xs text-gray-400 shrink-0 ml-2">{alert.time}</span>
             </li>
           ))}
        </ul>
      )}
    </div>
  );
}
