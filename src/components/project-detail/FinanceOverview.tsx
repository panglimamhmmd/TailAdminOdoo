import React, { useMemo } from 'react';
import { SubProject, FinanceGroup } from '@/types/project';

interface FinanceOverviewProps {
  currentSubProject: SubProject;
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({ currentSubProject }) => {
  
  const financeStats = useMemo(() => {
    const groups = currentSubProject.finances.groups;
    
    // Income: journal_id[0] === 8
    const incomeGroups = groups.filter(g => g.journal_id[0] === 8);
    const incomeTotal = incomeGroups.reduce((sum, g) => sum + g.amount_total, 0);
    const incomeCount = incomeGroups.reduce((sum, g) => sum + g.__count, 0);

    // Outcome: journal_id[0] in [9, 15, 16]
    const outcomeGroups = groups.filter(g => [9, 15, 16].includes(g.journal_id[0]));
    const outcomeTotal = outcomeGroups.reduce((sum, g) => sum + g.amount_total, 0);
    const outcomeCount = outcomeGroups.reduce((sum, g) => sum + g.__count, 0);

    // Balance
    const balance = incomeTotal - outcomeTotal;

    return { incomeTotal, incomeCount, outcomeTotal, outcomeCount, balance };
  }, [currentSubProject.finances.groups]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Finance Overview</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Income vs Outcome analysis</p>
      </div>
      
      <div className="p-6">
        {/* Income vs Outcome Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Income */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-xl p-5 border border-emerald-200 dark:border-emerald-900/50">
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Income</div>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-400">
              Rp {financeStats.incomeTotal.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {financeStats.incomeCount} invoices
            </div>
          </div>

          {/* Outcome */}
          <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-xl p-5 border border-rose-200 dark:border-rose-900/50">
            <div className="text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">Outcome</div>
            <div className="text-xl font-bold text-rose-900 dark:text-rose-400">
              Rp {financeStats.outcomeTotal.toLocaleString()}
            </div>
            <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
              {financeStats.outcomeCount} bills
            </div>
          </div>

          {/* Balance */}
          <div className={`rounded-xl p-5 border ${
            financeStats.balance >= 0 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900/50'
              : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900/50'
          }`}>
            <div className={`text-sm font-medium mb-1 ${financeStats.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>Balance</div>
            <div className={`text-xl font-bold ${financeStats.balance >= 0 ? 'text-blue-900 dark:text-blue-400' : 'text-amber-900 dark:text-amber-400'}`}>
              Rp {Math.abs(financeStats.balance).toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${financeStats.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {financeStats.balance >= 0 ? 'Surplus' : 'Deficit'}
            </div>
          </div>
        </div>

        {/* Outcome Breakdown */}
        <FinanceBreakdownTable 
          title="Outcome Details"
          categories={[
            { id: 9, name: 'Vendor Bills' },
            { id: 15, name: 'Pelaksana' },
            { id: 16, name: 'Tukang' }
          ]}
          groups={currentSubProject.finances.groups}
        />

        {/* Income Breakdown */}
        <FinanceBreakdownTable 
          title="Income Details"
          categories={[
            { id: 8, name: 'Invoices' }
          ]}
          groups={currentSubProject.finances.groups}
        />
      </div>
    </div>
  );
};

interface FinanceBreakdownProps {
  title: string;
  categories: { id: number; name: string }[];
  groups: FinanceGroup[];
}

const FinanceBreakdownTable: React.FC<FinanceBreakdownProps> = ({ title, categories, groups }) => {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
      <div className="overflow-x-auto">
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 min-w-max">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Category</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Draft</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Paid</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Not Paid</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Partial</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {categories.map(category => {
                const items = groups.filter(g => g.journal_id[0] === category.id);
                const paid = items.filter(g => g.status_in_payment === 'paid').reduce((sum, g) => sum + g.amount_total, 0);
                const notPaid = items.filter(g => g.status_in_payment === 'not_paid').reduce((sum, g) => sum + g.amount_total, 0);
                const partial = items.filter(g => g.status_in_payment === 'partial').reduce((sum, g) => sum + g.amount_total, 0);
                const draft = items.filter(g => g.status_in_payment === 'draft').reduce((sum, g) => sum + g.amount_total, 0);
                const total = items.reduce((sum, g) => sum + g.amount_total, 0);
                
                return (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{category.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-500 text-right whitespace-nowrap">
                      Rp {draft.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-800 dark:text-green-400 text-right whitespace-nowrap">
                      Rp {paid.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium whitespace-nowrap ${notPaid > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      Rp {notPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-amber-600 dark:text-amber-400 text-right whitespace-nowrap">
                      Rp {partial.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">
                      Rp {total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
