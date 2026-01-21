
import React, { useState, useMemo } from 'react';
import { FinanceDetail } from '@/types/project';
import { 
  Calendar, 
  Search, 
  Layers, 
  ChevronDown, 
  X,
} from 'lucide-react';

// ==========================================
// Types & Interfaces
// ==========================================

type GroupByOption = 'journal' | 'partner' | 'status' | 'none';
type TimeRangeOption = 'all' | 'this_month' | 'last_month' | 'last_3_months' | 'this_year';

// ==========================================
// Helper Components
// ==========================================

const FilterDropdown: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}> = ({ label, icon, value, options, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:border-blue-400 transition-colors"
      >
        <span className="text-gray-400">{icon}</span>
        <span className="text-gray-600 dark:text-gray-300">{options.find(o => o.value === value)?.label || label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === opt.value 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ==========================================
// Finance Table Component
// ==========================================

export const FinanceTable: React.FC<{ title: string, data: FinanceDetail[], accentColor?: 'emerald' | 'rose' | 'blue' | 'gray' }> = ({ title, data, accentColor = 'gray' }) => {
   const [sortConfig, setSortConfig] = useState<{ key: keyof FinanceDetail; direction: 'asc' | 'desc' } | null>(null);
   const [isOpen, setIsOpen] = useState(true);

   const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      // Handle string comparison for names/refs to be safe
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      
      // Handle arrays (many2one fields) by taking the name (index 1) or id (index 0)
      const compA = Array.isArray(valA) ? valA[1] : valA;
      const compB = Array.isArray(valB) ? valB[1] : valB;

      if (compA < compB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (compA > compB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
   }, [data, sortConfig]);

   const totalAmount = useMemo(() => data.reduce((sum, item) => {
       // Check if it's income or outcome to sum correctly or just simple sum?
       // Usuaally amount_total is positive. Context determines sign.
       // Let's just sum absolute values or follow existing logic where Invoices are Income.
       return sum + item.amount_total;
   }, 0), [data]);

   const requestSort = (key: keyof FinanceDetail) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  if (!data || data.length === 0) return null;

  const colorStyles = {
      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      gray: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
  };
  
  const textStyles = {
      emerald: 'text-emerald-600 dark:text-emerald-400',
      rose: 'text-rose-600 dark:text-rose-400',
      blue: 'text-blue-600 dark:text-blue-400',
      gray: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isOpen ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' : 'border-transparent bg-gray-50 dark:bg-gray-800/20'
    }`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
            isOpen 
            ? 'bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl'
        }`}
      >
          <div className="flex items-center gap-3">
             <div className={`p-1.5 rounded-lg ${colorStyles[accentColor]}`}>
                <Layers className="w-4 h-4" />
             </div>
             <div className="flex flex-col items-start md:flex-row md:items-center md:gap-3">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{title}</h4>
                <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
                <span className={`text-sm font-bold ${textStyles[accentColor]}`}>
                    Rp {totalAmount.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 font-normal">({data.length} items)</span>
             </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
      <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
        <table className="w-full text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
                <th onClick={() => requestSort('date')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Date</th>
                <th onClick={() => requestSort('name')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Description</th>
                <th onClick={() => requestSort('partner_id')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Partner</th>
                <th onClick={() => requestSort('journal_id')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Journal</th>
                <th onClick={() => requestSort('payment_state')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th onClick={() => requestSort('amount_total')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-3 px-4 text-right font-medium text-gray-500 dark:text-gray-400">Amount</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {sortedData.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4 text-gray-900 dark:text-white whitespace-nowrap text-xs md:text-sm">{item.date}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300 max-w-[150px] md:max-w-[250px] truncate font-medium" title={(item.name as unknown as string) || (item.ref as unknown as string) || ''}>{item.name || item.ref || '-'}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs md:text-sm whitespace-nowrap">
                    {Array.isArray(item.partner_id) ? item.partner_id[1] : '-'}
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wide whitespace-nowrap">
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {Array.isArray(item.journal_id) ? item.journal_id[1] : 'Unknown'}
                    </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-[10px] font-semibold rounded-full capitalize ${
                        item.payment_state === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        item.payment_state === 'not_paid' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                    {item.payment_state ? item.payment_state.replace(/_/g, ' ') : 'Draft'}
                    </span>
                </td>
                <td className={`py-3 px-4 text-right font-bold whitespace-nowrap text-xs md:text-sm ${
                    (Array.isArray(item.journal_id) && item.journal_id[0] === 8) 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                    {(Array.isArray(item.journal_id) && item.journal_id[0] === 8) ? '+' : '-' } Rp {item.amount_total.toLocaleString()}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

// ==========================================
// Finance List View (Container)
// ==========================================

export const FinanceTransactionList: React.FC<{ details: FinanceDetail[] }> = ({ details }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('journal');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('all');

  const filteredDetails = useMemo(() => {
     let data = details;
     
     // 1. Text Search
     if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        data = data.filter(d => 
            (typeof d.name === 'string' && d.name.toLowerCase().includes(lowerTerm)) ||
            (typeof d.ref === 'string' && d.ref.toLowerCase().includes(lowerTerm)) || 
            (Array.isArray(d.partner_id) && d.partner_id[1].toLowerCase().includes(lowerTerm))
        );
     }

     // 2. Time Range Filter
     if (timeRange !== 'all') {
         const now = new Date();
         const month = now.getMonth();
         const year = now.getFullYear();

         data = data.filter(d => {
             const dDate = new Date(d.date);
             const dMonth = dDate.getMonth();
             const dYear = dDate.getFullYear();

             if (timeRange === 'this_month') return dMonth === month && dYear === year;
             if (timeRange === 'last_month') {
                 // Handle Jan -> Dec previous year
                 const lastMonth = month === 0 ? 11 : month - 1;
                 const lastMonthYear = month === 0 ? year - 1 : year;
                 return dMonth === lastMonth && dYear === lastMonthYear;
             }
             if (timeRange === 'this_year') return dYear === year;
             
             // 'last_3_months'
             const threeMonthsAgo = new Date();
             threeMonthsAgo.setMonth(now.getMonth() - 3);
             return dDate >= threeMonthsAgo;
         });
     }

     return data;
  }, [details, searchTerm, timeRange]);

  // Dynamic Grouping
  const groupedData = useMemo(() => {
      const groups: Record<string, FinanceDetail[]> = {};
      
      if (groupBy === 'none') {
          return { 'All Transactions': filteredDetails };
      }

      filteredDetails.forEach(item => {
          let key = 'Other';
          
          if (groupBy === 'journal') {
              // Special case for Income/Outcome separation if grouping by journal
              // We could just use journal name
              key = Array.isArray(item.journal_id) ? item.journal_id[1] : 'Unknown Journal';
          } else if (groupBy === 'partner') {
              key = Array.isArray(item.partner_id) ? item.partner_id[1] : 'No Partner';
          } else if (groupBy === 'status') {
              key = item.payment_state ? item.payment_state.replace(/_/g, ' ') : 'Draft';
              // Capitalize
              key = key.charAt(0).toUpperCase() + key.slice(1);
          }

          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
      });
      
      return groups;
  }, [filteredDetails, groupBy]);

  const groupKeys = Object.keys(groupedData).sort();

  if(!details || details.length === 0) {
      return (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              No detailed transactions available.
          </div>
      )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-750 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <FilterDropdown 
                    label="Group By"
                    icon={<Layers className="w-4 h-4" />}
                    value={groupBy}
                    options={[
                        { label: 'Journal (Default)', value: 'journal' },
                        { label: 'Partner', value: 'partner' },
                        { label: 'Status', value: 'status' },
                        { label: 'None (Flat List)', value: 'none' },
                    ]}
                    onChange={(val) => setGroupBy(val as GroupByOption)}
                />
                <FilterDropdown 
                    label="Time Range"
                    icon={<Calendar className="w-4 h-4" />}
                    value={timeRange}
                    options={[
                        { label: 'All Time', value: 'all' },
                        { label: 'This Month', value: 'this_month' },
                        { label: 'Last Month', value: 'last_month' },
                        { label: 'Last 3 Months', value: 'last_3_months' },
                        { label: 'This Year', value: 'this_year' },
                    ]}
                    onChange={(val) => setTimeRange(val as TimeRangeOption)}
                />
                {(searchTerm || groupBy !== 'journal' || timeRange !== 'all') && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setGroupBy('journal');
                            setTimeRange('all');
                        }}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Reset Filters"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>

        {/* Dynamic Groups */}
        <div className="space-y-6">
            {groupKeys.map(key => {
                // Determine accent color based on group content or type
                let accent: 'emerald' | 'rose' | 'blue' | 'gray' = 'gray';
                const groupItems = groupedData[key];
                
                // Heuristic for color
                // If grouping by Journal
                if (groupBy === 'journal') {
                    // Check if mostly income or outcome
                    const isIncome = groupItems.some(i => Array.isArray(i.journal_id) && i.journal_id[0] === 8);
                    const isOutcome = groupItems.some(i => Array.isArray(i.journal_id) && [9, 15, 16].includes(i.journal_id[0]));
                    if (isIncome && !isOutcome) accent = 'emerald';
                    else if (isOutcome && !isIncome) accent = 'rose';
                    else accent = 'blue';
                } 
                // If grouping by Status
                else if (groupBy === 'status') {
                   if (key.toLowerCase().includes('paid') && !key.toLowerCase().includes('not')) accent = 'emerald';
                   else if (key.toLowerCase().includes('not paid')) accent = 'rose';
                   else accent = 'blue';
                }
                // If grouping by Partner
                else if (groupBy === 'partner') {
                    accent = 'blue';
                }

                return (
                    <FinanceTable 
                        key={key} 
                        title={key} 
                        data={groupItems} 
                        accentColor={accent} 
                    />
                );
            })}
        </div>
        
        {filteredDetails.length === 0 && (
             <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                 <p>No transactions found matching your filters.</p>
                 <button 
                    onClick={() => {
                        setSearchTerm('');
                        setTimeRange('all');
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                 >
                    Clear Filters
                 </button>
             </div>
        )}
    </div>
  );
};
