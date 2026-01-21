'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FinanceTransactionList } from '@/components/finance/FinanceTransactionList';
import { SubProject, FinanceDetail } from '@/types/project';
import { ArrowLeft, Wallet, Building2 } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface ProjectResponse {
  success: boolean;
  projectName: string;
  subProjects: SubProject[];
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProjectFinanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectName = typeof params.projectName === 'string' ? decodeURIComponent(params.projectName) : '';
  
  const [data, setData] = useState<SubProject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectName) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/project/projectdetails/${encodeURIComponent(projectName)}`);
        if (!res.ok) throw new Error('Failed to fetch project details');
        const json: ProjectResponse = await res.json();
        setData(json.subProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectName]);

  // Aggregate Data across all sub-projects
  const aggregatedData = useMemo(() => {
    if (!data) return null;

    const allTransactions: FinanceDetail[] = data.flatMap(sp => sp.finances.details || []); // Flatten details
    
    // Sort by date desc
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalIncome = allTransactions
        .filter(t => Array.isArray(t.journal_id) && t.journal_id[0] === 8) // Invoices
        .reduce((sum, t) => sum + t.amount_total, 0);

    const totalOutcome = allTransactions
        .filter(t => Array.isArray(t.journal_id) && [9, 15, 16].includes(t.journal_id[0])) // Bills
        .reduce((sum, t) => sum + t.amount_total, 0);

    const totalRAB = data.reduce((sum, sp) => {
        // Just an approximation or sum of limits if available in details
        // The API returns details with x_studio_related_field... as budget
        return sum + (sp.details?.x_studio_related_field_180_1j3l9t4is || 0);
    }, 0);

    return {
        transactions: allTransactions,
        stats: {
            income: totalIncome,
            outcome: totalOutcome,
            balance: totalIncome - totalOutcome,
            rab: totalRAB
        }
    };
  }, [data]);


  if (loading) {
     return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading financial data...</p>
            </div>
        </div>
     );
  }

  if (error || !data || !aggregatedData) {
      return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
             <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                 <h3 className="text-lg font-bold text-red-600 mb-2">Error Loading Data</h3>
                 <p className="text-gray-500 mb-4">{error || 'Project not found'}</p>
                 <button 
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                 >
                    Go Back
                 </button>
             </div>
         </div>
      );
  }

  const { stats, transactions } = aggregatedData;
  const budgetUtilization = stats.rab > 0 ? (stats.outcome / stats.rab) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 md:p-8 font-sans">
        
        {/* Header */}
        <div className="mb-8">
            <button 
                onClick={() => router.back()}
                className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
            >
                <div className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors shadow-sm">
                   <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Back to Finance Overview</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                        {projectName}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
                            <Building2 className="w-3.5 h-3.5" />
                            {data.length} Sub-projects
                        </span>
                        <span>•</span>
                        <span>Financial Detail View</span>
                    </div>
                </div>
                
                <div className="flex gap-2"> 
                    {/* Actions if needed, e.g. Export */}
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Revenue */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
                      <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{formatRupiah(stats.income)}</h3>
                  </div>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                      <ArrowDownRight className="w-5 h-5" />
                  </div>
               </div>
               <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1">
                   <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '100%' }}></div>
               </div>
            </div>

            {/* Expenses */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Spent</p>
                      <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{formatRupiah(stats.outcome)}</h3>
                  </div>
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl">
                      <ArrowUpRight className="w-5 h-5" />
                  </div>
               </div>
               <div className="flex items-center gap-2 mt-2">
                   <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${budgetUtilization > 100 ? 'bg-red-600' : 'bg-rose-500'}`} 
                         style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                        ></div>
                   </div>
                   <span className="text-xs font-medium text-rose-600">{budgetUtilization.toFixed(0)}% of RAB</span>
               </div>
            </div>

            {/* Balance */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Net Balance</p>
                      <h3 className={`text-2xl font-extrabold mt-1 ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                          {formatRupiah(stats.balance)}
                      </h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stats.balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      <Wallet className="w-5 h-5" />
                  </div>
               </div>
                <div className="text-xs text-gray-500 font-medium">
                    {stats.balance >= 0 ? 'Healthy Surplus' : 'Running Deficit'}
                </div>
            </div>

            {/* RAB */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total RAB</p>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{formatRupiah(stats.rab)}</h3>
                  </div>
                  <div className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl">
                      <Building2 className="w-5 h-5" />
                  </div>
               </div>
               <div className="text-xs text-gray-400">Total Budget Allocation</div>
            </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Detailed Transactions</h3>
            <FinanceTransactionList details={transactions} />
        </div>
    </div>
  );
}
