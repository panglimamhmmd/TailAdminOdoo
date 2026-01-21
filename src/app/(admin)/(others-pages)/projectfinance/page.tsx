'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  LayoutGrid, 
  List as ListIcon, 
  Table as TableIcon, 
  Filter,
  ChevronDown,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

// ======================
// Types
// ======================

interface PaymentStatusDetail {
  amount: number;
  count: number;
}

interface PaymentStatus {
  paid: PaymentStatusDetail;
  unpaid: PaymentStatusDetail;
  partial: PaymentStatusDetail;
  draft: PaymentStatusDetail;
}

interface ProjectSummary {
  projectName: string;
  category: string;
  stage: string; // Added stage
  RAB: number;
  progress: number;
  invoice: PaymentStatus;
  vendorBills: PaymentStatus;
  pekerja: PaymentStatus;
  pelaksana: PaymentStatus;
}

interface ApiResponse {
  success: boolean;
  data: ProjectSummary[];
  timestamp: string;
}

// ======================
// Helper Functions
// ======================

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getTotalAmount = (status: PaymentStatus): number => {
  return status.paid.amount + status.unpaid.amount + status.partial.amount + status.draft.amount;
};

const getTotalCount = (status: PaymentStatus): number => {
  return status.paid.count + status.unpaid.count + status.partial.count + status.draft.count;
};

// ======================
// Sub-Components
// ======================

const PaymentStatusRow: React.FC<{ 
  label: string, 
  amount: number, 
  count: number, 
  colorClass: string 
  icon?: React.ReactNode
}> = ({ label, amount, count, colorClass, icon }) => (
  <div className="flex justify-between items-center text-xs py-1">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
       {icon}
       <span>{label}</span>
    </div>
    <div className="flex items-center gap-2">
       <span className={`font-medium ${colorClass}`}>{formatRupiah(amount)}</span>
       <span className="text-gray-400 text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 rounded-full">{count}</span>
    </div>
  </div>
);

const PaymentDetailsBlock: React.FC<{ status: PaymentStatus; title: string; type: 'income' | 'outcome' }> = ({ status, title, type }) => {
  const total = getTotalAmount(status);
  const totalCount = getTotalCount(status);
  const isIncome = type === 'income';
  const mainColor = isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const bgSoft = isIncome ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10';

  return (
    <div className={`p-4 rounded-xl border border-gray-100 dark:border-gray-700 ${bgSoft}`}>
      <div className="flex justify-between items-center mb-3">
        <h5 className={`text-sm font-bold flex items-center gap-2 ${mainColor}`}>
           {isIncome ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
           {title}
        </h5>
        <div className="text-right">
           <div className={`font-bold text-sm ${mainColor}`}>{formatRupiah(total)}</div>
           <div className="text-[10px] text-gray-500">{totalCount} items</div>
        </div>
      </div>
      
      <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700/50">
        {status.paid.count > 0 && <PaymentStatusRow label="Paid" amount={status.paid.amount} count={status.paid.count} colorClass="text-green-600" />}
        {status.partial.count > 0 && <PaymentStatusRow label="Partial" amount={status.partial.amount} count={status.partial.count} colorClass="text-yellow-600" />}
        {status.unpaid.count > 0 && <PaymentStatusRow label="Unpaid" amount={status.unpaid.amount} count={status.unpaid.count} colorClass="text-red-600" />}
        {status.draft.count > 0 && <PaymentStatusRow label="Draft" amount={status.draft.amount} count={status.draft.count} colorClass="text-gray-500" />}
      </div>
    </div>
  );
};

// ======================
// View Components
// ======================

// ======================
// Helper Components
// ======================

const StatCard: React.FC<{
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'orange';
}> = ({ title, value, subValue, icon, color }) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{value}</h3>
        {subValue && <p className="text-xs text-gray-500 font-medium">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorStyles[color]} flex items-center justify-center`}>
         {icon}
      </div>
    </div>
  );
};

// ... (Existing Sub-Components: PaymentStatusRow, PaymentDetailsBlock remain effectively unchanged in logic, 
// but we will inline them or keep them if they were outside the main export. 
// For clarity in this Replace, I will assume they are defined above or I will re-include them if I am replacing the whole file context.
// Since I am replacing the Main Page Component primarily, I will focus on that, but the user request implied updating UI/UX.
// To implement 'Budget Burn', I need to update ProjectCard and ProjectListItem.)

// ... Let's update ProjectCard to include Budget Burn ...

const BudgetBurnBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isOverBudget = current > max;
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mb-1">
        <span>Budget Used</span>
        <span className={isOverBudget ? 'text-red-500' : 'text-gray-600'}>
          {percentage.toFixed(1)}% {isOverBudget && '(OVER)'}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-gray-600 dark:bg-gray-400'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ... Re-implement ProjectCard with BudgetBurnBar ...

const ProjectCard: React.FC<{ project: ProjectSummary }> = ({ project }) => {
  const [expanded, setExpanded] = useState(false);
  
  const totalIncome = getTotalAmount(project.invoice);
  
  const totalOutcome = 
    getTotalAmount(project.vendorBills) +
    getTotalAmount(project.pekerja) +
    getTotalAmount(project.pelaksana);
    
  const balance = totalIncome - totalOutcome;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-3">
             <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  project.stage === 'Done' ? 'bg-green-100 text-green-700' : 
                  project.stage === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {project.stage || 'Unknown'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 border border-gray-200 rounded-full">
                   {project.category}
                </span>
             </div>
             <Link href={`/projectfinance/${encodeURIComponent(project.projectName)}`} className="hover:underline">
               <h3 className="font-bold text-gray-900 dark:text-white truncate" title={project.projectName}>
                 {project.projectName}
               </h3>
             </Link>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xl font-bold text-blue-600">{project.progress}%</span>
          </div>
        </div>
        
        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 mt-4">
           <div>
              <p className="text-xs text-gray-400 mb-0.5">Revenue</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{formatRupiah(totalIncome)}</p>
           </div>
           <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Expenses</p>
              <p className="font-semibold text-red-600 dark:text-red-400">{formatRupiah(totalOutcome)}</p>
           </div>
        </div>

        {/* Budget Burn Bar */}
        <BudgetBurnBar current={totalOutcome} max={project.RAB} />

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50 dark:border-gray-700/50">
           <span className="text-xs text-gray-400 font-medium">Net Bal.</span>
           <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatRupiah(balance)}
           </span>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="flex-1 bg-gray-50/30 dark:bg-gray-800/30 p-4">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
        >
          <span>Breakdown</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {expanded && (
           <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
             <PaymentDetailsBlock status={project.invoice} title="Incoming Payments" type="income" />
             <div className="space-y-2">
               <h5 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
                 <ArrowUpRight className="w-3 h-3" /> Expenses
               </h5>
               <PaymentDetailsBlock status={project.vendorBills} title="Vendor Bills" type="outcome" />
               <div className="grid grid-cols-2 gap-2">
                 <PaymentDetailsBlock status={project.pekerja} title="Pekerja" type="outcome" />
                 <PaymentDetailsBlock status={project.pelaksana} title="Pelaksana" type="outcome" />
               </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

// ... Update ProjectListItem with BudgetBurn ...

const ProjectListItem: React.FC<{ project: ProjectSummary }> = ({ project }) => {
  const [expanded, setExpanded] = useState(false);
  const totalIncome = getTotalAmount(project.invoice);
  const totalOutcome = getTotalAmount(project.vendorBills) + getTotalAmount(project.pekerja) + getTotalAmount(project.pelaksana);
  const balance = totalIncome - totalOutcome;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm transition-all duration-200 overflow-hidden">
      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
         {/* Main Info */}
         <div className="md:col-span-4 min-w-[200px]">
            <div className="flex items-center gap-3 mb-1">
               <Link href={`/projectfinance/${encodeURIComponent(project.projectName)}`} className="hover:underline">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate" title={project.projectName}>{project.projectName}</h3>
               </Link>
               <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold shrink-0 ${
                  project.stage === 'Done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
               }`}>
                 {project.stage || 'N/A'}
               </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
               <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {project.category}</span>
               <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> RAB: {formatRupiah(project.RAB)}</span>
            </div>
         </div>

         {/* Budget Burn */}
         <div className="md:col-span-3">
             <BudgetBurnBar current={totalOutcome} max={project.RAB} />
         </div>

         {/* Stats */}
         <div className="md:col-span-4 flex items-center justify-end gap-6 text-sm">
            <div className="text-right">
               <p className="text-[10px] text-gray-400 uppercase font-bold">Income</p>
               <p className="font-medium text-green-600">{formatRupiah(totalIncome)}</p>
            </div>
             <div className="text-right">
               <p className="text-[10px] text-gray-400 uppercase font-bold">Outcome</p>
               <p className="font-medium text-red-600">{formatRupiah(totalOutcome)}</p>
            </div>
            <div className="text-right min-w-[80px]">
               <p className="text-[10px] text-gray-400 uppercase font-bold">Bal.</p>
               <p className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRupiah(balance)}</p>
            </div>
         </div>

         {/* Action */}
         <div className="md:col-span-1 text-right">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
               {expanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
            </button>
         </div>
      </div>

      {expanded && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
            <div>
               <PaymentDetailsBlock status={project.invoice} title="Incoming Payments" type="income" />
            </div>
            <div className="space-y-4">
               <PaymentDetailsBlock status={project.vendorBills} title="Vendor Bills" type="outcome" />
               <div className="grid grid-cols-2 gap-4">
                  <PaymentDetailsBlock status={project.pekerja} title="Pekerja" type="outcome" />
                  <PaymentDetailsBlock status={project.pelaksana} title="Pelaksana" type="outcome" />
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

// ... Keeping ProjectTable as is, maybe minor touchup if needed, but the diff might get too large.
// I will keep ProjectTable broadly similar but ensure it's compatible with the flow.

const ProjectTable: React.FC<{ projects: ProjectSummary[] }> = ({ projects }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) newExpanded.delete(index);
    else newExpanded.add(index);
    setExpandedRows(newExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500">Project</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-500">Stage</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-500">RAB</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-500">Progress</th>
              <th className="px-4 py-3 text-right font-semibold text-green-600">Income</th>
              <th className="px-4 py-3 text-right font-semibold text-red-600">Outcome</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {projects.map((project, index) => {
              const totalIncome = getTotalAmount(project.invoice);
              const totalOutcome = getTotalAmount(project.vendorBills) + getTotalAmount(project.pekerja) + getTotalAmount(project.pelaksana);
              const balance = totalIncome - totalOutcome;
              const isExpanded = expandedRows.has(index);

              return (
                <React.Fragment key={index}>
                  <tr 
                    onClick={() => toggleRow(index)}
                    className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-4 py-4 text-center text-gray-400">
                       {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-4 py-4">
                       <Link href={`/projectfinance/${encodeURIComponent(project.projectName)}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          <div className="font-bold text-gray-900 dark:text-white">{project.projectName}</div>
                       </Link>
                       <div className="text-xs text-gray-500">{project.category}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                          project.stage === 'Done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                       }`}>
                         {project.stage || '-'}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-600">{formatRupiah(project.RAB)}</td>
                    <td className="px-4 py-4 text-center">
                       <div className="inline-flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                             <div className="bg-blue-600 h-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="text-xs">{project.progress}%</span>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-green-600">{formatRupiah(totalIncome)}</td>
                    <td className="px-4 py-4 text-right font-medium text-red-600">{formatRupiah(totalOutcome)}</td>
                    <td className={`px-4 py-4 text-right font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {formatRupiah(balance)}
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-gray-50 dark:bg-gray-800/50 shadow-inner">
                      <td colSpan={8} className="px-6 py-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <PaymentDetailsBlock status={project.invoice} title="Incoming Payments" type="income" />
                            <div className="space-y-4">
                               <PaymentDetailsBlock status={project.vendorBills} title="Vendor Bills" type="outcome" />
                               <div className="grid grid-cols-2 gap-4">
                                  <PaymentDetailsBlock status={project.pekerja} title="Pekerja" type="outcome" />
                                  <PaymentDetailsBlock status={project.pelaksana} title="Pelaksana" type="outcome" />
                               </div>
                            </div>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// ======================
// Filter Component
// ======================

const FilterDropdown: React.FC<{
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}> = ({ label, icon, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-500 transition-colors min-w-[200px]"
      >
        <span className="text-gray-400">{icon}</span>
        <div className="flex-1 text-left">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
           <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{selected}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl z-50 max-h-60 overflow-y-auto p-1">
           {options.map((option) => (
             <button
               key={option}
               onClick={() => {
                 onChange(option);
                 setIsOpen(false);
               }}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                 selected === option 
                 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium' 
                 : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
               }`}
             >
               {option}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};


// ======================
// Main Page Component
// ======================

export default function ProjectSummaryDashboard() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Balance (Low-High)');
  const [viewType, setViewType] = useState<'card' | 'table' | 'list'>('card');

  useEffect(() => {
    fetch('/api/project/summary')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then((data: ApiResponse) => setProjects(data.data))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  // Compute Unique Filters
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  const stages = ['All', ...Array.from(new Set(projects.map(p => p.stage))).filter(Boolean)];

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchStage = selectedStage === 'All' || p.stage === selectedStage;
      return matchCat && matchStage;
    })
    .sort((a, b) => {
      const getBalance = (p: ProjectSummary) => getTotalAmount(p.invoice) - (getTotalAmount(p.vendorBills) + getTotalAmount(p.pekerja) + getTotalAmount(p.pelaksana));
      const getExpense = (p: ProjectSummary) => getTotalAmount(p.vendorBills) + getTotalAmount(p.pekerja) + getTotalAmount(p.pelaksana);
      
      switch (sortBy) {
        case 'Balance (Low-High)': return getBalance(a) - getBalance(b);
        case 'Balance (High-Low)': return getBalance(b) - getBalance(a);
        case 'Expenses (High-Low)': return getExpense(b) - getExpense(a);
        case 'Progress (High-Low)': return b.progress - a.progress;
        case 'RAB (High-Low)': return b.RAB - a.RAB;
        default: return 0;
      }
    });

  // Calculate Aggregates
  const totalIncome = filteredProjects.reduce((sum, p) => sum + getTotalAmount(p.invoice), 0);
  const totalExpense = filteredProjects.reduce((sum, p) => sum + getTotalAmount(p.vendorBills) + getTotalAmount(p.pekerja) + getTotalAmount(p.pelaksana), 0);
  const totalRAB = filteredProjects.reduce((sum, p) => sum + p.RAB, 0);
  const netBalance = totalIncome - totalExpense;
  const budgetUtilization = totalRAB > 0 ? (totalExpense / totalRAB) * 100 : 0;

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
           <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
           <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 md:p-8 font-sans">
      
      {/* Header & Stats */}
      <div className="mb-10">
         <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            Financial Analytics
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mb-6">
            Real-time project insights, budget utilization, and cash flow analysis.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
               title="Total Revenue" 
               value={formatRupiah(totalIncome)} 
               subValue={`${filteredProjects.length} Projects`}
               icon={<ArrowDownRight className="w-6 h-6" />}
               color="green"
            />
            <StatCard 
               title="Total Spent" 
               value={formatRupiah(totalExpense)} 
               subValue={`${budgetUtilization.toFixed(1)}% of Budget`}
               icon={<ArrowUpRight className="w-6 h-6" />}
               color="red"
            />
            <StatCard 
               title="Net Balance" 
               value={formatRupiah(netBalance)} 
               subValue={netBalance >= 0 ? 'Surplus' : 'Deficit'}
               icon={<Wallet className="w-6 h-6" />}
               color={netBalance >= 0 ? "blue" : "orange"}
            />
             <StatCard 
               title="Total RAB" 
               value={formatRupiah(totalRAB)} 
               subValue="Active Budget"
               icon={<Building2 className="w-6 h-6" />}
               color="blue"
            />
         </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 sticky top-4 z-30 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md py-4 -mx-2 px-2 border-b border-gray-200 dark:border-gray-800">
         {/* Filters & Sort */}
         <div className="flex flex-wrap items-center gap-4">
             <FilterDropdown 
                label="Sort By" 
                icon={<TrendingUp className="w-4 h-4" />}
                options={['Balance (Low-High)', 'Balance (High-Low)', 'Expenses (High-Low)', 'Progress (High-Low)', 'RAB (High-Low)']} 
                selected={sortBy} 
                onChange={setSortBy} 
             />

             <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-2 hidden md:block"></div>

             <FilterDropdown 
                label="Values in Stage" 
                icon={<Filter className="w-4 h-4" />}
                options={stages} 
                selected={selectedStage} 
                onChange={setSelectedStage} 
             />
             
             <FilterDropdown 
                label="Project Category" 
                icon={<LayoutGrid className="w-4 h-4" />}
                options={categories} 
                selected={selectedCategory} 
                onChange={setSelectedCategory} 
             />
         </div>

         {/* View Selector */}
         <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm self-start xl:self-auto">
             {[
               { id: 'card', icon: <LayoutGrid className="w-4 h-4" />, label: 'Cards' },
               { id: 'list', icon: <ListIcon className="w-4 h-4" />, label: 'List' },
               { id: 'table', icon: <TableIcon className="w-4 h-4" />, label: 'Table' },
             ].map((v) => (
                <button
                   key={v.id}
                   onClick={() => setViewType(v.id as 'card' | 'table' | 'list')}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                     viewType === v.id 
                     ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md transform scale-105' 
                     : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                   }`}
                >
                   {v.icon}
                   <span className="hidden sm:inline">{v.label}</span>
                </button>
             ))}
         </div>
      </div>

      {/* Content Area */}
      {filteredProjects.length === 0 ? (
         <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-gray-300 mb-4">
               <Filter className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No projects found</h3>
            <p className="text-gray-500">Adjust filters or search criteria.</p>
         </div>
      ) : (
         <div className="animate-in fade-in duration-500">
           {viewType === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                 {filteredProjects.map((p, i) => <ProjectCard key={i} project={p} />)}
              </div>
           )}
           {viewType === 'list' && (
              <div className="space-y-4">
                 {filteredProjects.map((p, i) => <ProjectListItem key={i} project={p} />)}
              </div>
           )}
           {viewType === 'table' && <ProjectTable projects={filteredProjects} />}
         </div>
      )}
    </div>
  );
}


