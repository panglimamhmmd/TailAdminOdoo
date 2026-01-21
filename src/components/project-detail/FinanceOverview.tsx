import React from 'react';
import { SubProject, FinanceGroup } from '@/types/project';
import { FinanceTransactionList } from '@/components/finance/FinanceTransactionList';

interface FinanceOverviewProps {
  currentSubProject: SubProject;
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({ currentSubProject }) => {
  const [viewMode, setViewMode] = React.useState<'cards' | 'list'>('cards');
  
  const financeStats = React.useMemo(() => {
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

    // Budget Usage Analysis
    const budget = currentSubProject.details?.x_studio_related_field_180_1j3l9t4is || 0;
    const budgetUsage = budget > 0 ? (outcomeTotal / budget) * 100 : 0;

    return { incomeTotal, incomeCount, outcomeTotal, outcomeCount, balance, budget, budgetUsage };
  }, [currentSubProject.finances.groups, currentSubProject.details]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div>
           <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Finance Overview</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">Income vs Outcome analysis</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'cards' 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Transactions
          </button>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        {viewMode === 'cards' ? (
          <>
            {/* Income vs Outcome Summary */}
           {/* ... (Existing Cards logic I am not changing, just omitting for brevity in diff tool if safe, 
                   but replace_file will want exact content. 
                   Actually, I should just DELETE the duplicate definitions and Update the render) */}
            
            {/* ... (re-include all card logic here to be safe with Replace) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 animate-in fade-in duration-300">
              {/* Income */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-xl p-4 md:p-5 border border-emerald-200 dark:border-emerald-900/50">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Income</div>
                <div className="text-lg md:text-xl font-bold text-emerald-900 dark:text-emerald-400">
                  Rp {financeStats.incomeTotal.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  {financeStats.incomeCount} invoices
                </div>
              </div>

              {/* Outcome */}
              <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-xl p-4 md:p-5 border border-rose-200 dark:border-rose-900/50">
                <div className="text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">Outcome</div>
                <div className="text-lg md:text-xl font-bold text-rose-900 dark:text-rose-400">
                  Rp {financeStats.outcomeTotal.toLocaleString()}
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {financeStats.outcomeCount} bills
                </div>
                
                {/* Budget Usage Context */}
                {financeStats.budget > 0 && (
                  <div className="mt-3 pt-3 border-t border-rose-200/50 dark:border-rose-800/50">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-rose-700 dark:text-rose-300 font-medium">Budget Used</span>
                      <span className="font-bold text-rose-800 dark:text-rose-200">{financeStats.budgetUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-rose-200/50 dark:bg-rose-900/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                           financeStats.budgetUsage > 100 ? 'bg-red-600' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(financeStats.budgetUsage, 100)}%` }} 
                      />
                    </div>
                    <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-1 text-right">
                      of Rp {financeStats.budget.toLocaleString()} RAB
                    </div>
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className={`rounded-xl p-4 md:p-5 border ${
                financeStats.balance >= 0 
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900/50'
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900/50'
              }`}>
                <div className={`text-sm font-medium mb-1 ${financeStats.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>Balance</div>
                <div className={`text-lg md:text-xl font-bold ${financeStats.balance >= 0 ? 'text-blue-900 dark:text-blue-400' : 'text-amber-900 dark:text-amber-400'}`}>
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
          </>
        ) : (
          <FinanceTransactionList details={currentSubProject.finances.details || []} />
        )}
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
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="mb-4 last:mb-0 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200">
          <div className="overflow-x-auto">
            <div className="min-w-[600px] md:min-w-full">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                    <th className="py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Draft</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Not Paid</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Partial</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {categories.map(category => {
                    const items = groups.filter(g => g.journal_id[0] === category.id);
                    const paid = items.filter(g => g.status_in_payment === 'paid').reduce((sum, g) => sum + g.amount_total, 0);
                    const notPaid = items.filter(g => g.status_in_payment === 'not_paid').reduce((sum, g) => sum + g.amount_total, 0);
                    const partial = items.filter(g => g.status_in_payment === 'partial').reduce((sum, g) => sum + g.amount_total, 0);
                    const draft = items.filter(g => g.status_in_payment === 'draft').reduce((sum, g) => sum + g.amount_total, 0);
                    const total = items.reduce((sum, g) => sum + g.amount_total, 0);
                    
                    return (
                      <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-3 text-sm font-medium text-gray-900 dark:text-white">{category.name}</td>
                        <td className="py-3 px-3 text-sm text-gray-500 text-right">Rp {draft.toLocaleString()}</td>
                        <td className="py-3 px-3 text-sm text-emerald-600 dark:text-emerald-400 text-right">Rp {paid.toLocaleString()}</td>
                        <td className={`py-3 px-3 text-sm text-right font-medium ${notPaid > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>
                          Rp {notPaid.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-sm text-amber-600 dark:text-amber-400 text-right">Rp {partial.toLocaleString()}</td>
                        <td className="py-3 px-3 text-sm font-bold text-gray-900 dark:text-white text-right">Rp {total.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
