'use client'
import React, { useState, useEffect } from 'react';

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

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const getTotalAmount = (status: PaymentStatus): number => {
  return status.paid.amount + status.unpaid.amount + status.partial.amount + status.draft.amount;
};

const getTotalCount = (status: PaymentStatus): number => {
  return status.paid.count + status.unpaid.count + status.partial.count + status.draft.count;
};

// Payment Status Display Component
const PaymentStatusDisplay: React.FC<{ status: PaymentStatus; label: string }> = ({ status, label }) => {
  const total = getTotalAmount(status);
  const totalCount = getTotalCount(status);
  
  if (total === 0) return null;

  return (
    <div className="mb-4">
      <div className="font-semibold text-gray-800 dark:text-white mb-2">
        {label}: <span className="text-blue-600 dark:text-blue-400">{formatRupiah(total)}</span> ({totalCount} items)
      </div>
      <div className="ml-4 space-y-1">
        {status.paid.count > 0 && (
          <div className="flex items-center text-sm text-green-600 dark:text-green-400">
            <span className="w-4 mr-2">✓</span>
            Paid: {formatRupiah(status.paid.amount)} ({status.paid.count} items)
          </div>
        )}
        {status.unpaid.count > 0 && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="w-4 mr-2">✗</span>
            Unpaid: {formatRupiah(status.unpaid.amount)} ({status.unpaid.count} items)
          </div>
        )}
        {status.partial.count > 0 && (
          <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
            <span className="w-4 mr-2">◐</span>
            Partial: {formatRupiah(status.partial.amount)} ({status.partial.count} items)
          </div>
        )}
        {status.draft.count > 0 && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="w-4 mr-2">📝</span>
            Draft: {formatRupiah(status.draft.amount)} ({status.draft.count} items)
          </div>
        )}
      </div>
    </div>
  );
};

// Card View Component
const ProjectCard: React.FC<{ project: ProjectSummary }> = ({ project }) => {
  const [isIncomeExpanded, setIsIncomeExpanded] = useState(false);
  const [isOutcomeExpanded, setIsOutcomeExpanded] = useState(false);

  const totalIncome = getTotalAmount(project.invoice);
  const totalIncomeCount = getTotalCount(project.invoice);
  
  const totalOutcome = 
    getTotalAmount(project.vendorBills) +
    getTotalAmount(project.pekerja) +
    getTotalAmount(project.pelaksana);

  const totalOutcomeCount =
    getTotalCount(project.vendorBills) +
    getTotalCount(project.pekerja) +
    getTotalCount(project.pelaksana);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {project.projectName}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {project.category}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progress: {project.progress}%</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">RAB: {formatRupiah(project.RAB)}</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Income Section */}
      <div className="mb-4">
        <div 
          onClick={() => setIsIncomeExpanded(!isIncomeExpanded)} 
          className="flex items-center cursor-pointer font-semibold p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          <span className="mr-2">{isIncomeExpanded ? '▼' : '▶'}</span>
          <span className="text-green-600 dark:text-green-400">
            Income: {formatRupiah(totalIncome)} ({totalIncomeCount} items)
          </span>
        </div>
        {isIncomeExpanded && (
          <div className="mt-3 ml-4">
            <PaymentStatusDisplay status={project.invoice} label="Invoice" />
          </div>
        )}
      </div>

      {/* Outcome Section */}
      <div>
        <div 
          onClick={() => setIsOutcomeExpanded(!isOutcomeExpanded)} 
          className="flex items-center cursor-pointer font-semibold p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          <span className="mr-2">{isOutcomeExpanded ? '▼' : '▶'}</span>
          <span className="text-red-600 dark:text-red-400">
            Outcome: {formatRupiah(totalOutcome)} ({totalOutcomeCount} items)
          </span>
        </div>
        {isOutcomeExpanded && (
          <div className="mt-3 ml-4">
            <PaymentStatusDisplay status={project.vendorBills} label="Vendor Bills" />
            <PaymentStatusDisplay status={project.pekerja} label="Pekerja" />
            <PaymentStatusDisplay status={project.pelaksana} label="Pelaksana" />
          </div>
        )}
      </div>
    </div>
  );
};

// Table View Component with Expandable Rows
const ProjectTable: React.FC<{ projects: ProjectSummary[] }> = ({ projects }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="w-12 px-4 py-3 text-left"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RAB
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Income
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Outcome
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project, index) => {
              const totalIncome = getTotalAmount(project.invoice);
              const totalOutcome = 
                getTotalAmount(project.vendorBills) +
                getTotalAmount(project.pekerja) +
                getTotalAmount(project.pelaksana);
              const balance = totalIncome - totalOutcome;
              const isExpanded = expandedRows.has(index);

              return (
                <React.Fragment key={index}>
                  <tr 
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                    onClick={() => toggleRow(index)}
                  >
                    <td className="px-4 py-4 text-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                      {project.projectName}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                      {formatRupiah(project.RAB)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {project.progress}%
                        </span>
                        <div className="mt-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-green-600 dark:text-green-400 font-medium">
                      {formatRupiah(totalIncome)}
                    </td>
                    <td className="px-4 py-4 text-right text-red-600 dark:text-red-400 font-medium">
                      {formatRupiah(totalOutcome)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">
                      <span className={balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {formatRupiah(balance)}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50 dark:bg-gray-750">
                      <td colSpan={8} className="px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center">
                              <span className="w-2 h-4 bg-green-500 mr-2 rounded"></span>
                              Income Details
                            </h4>
                            <PaymentStatusDisplay status={project.invoice} label="Invoice" />
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                              <span className="w-2 h-4 bg-red-500 mr-2 rounded"></span>
                              Outcome Details
                            </h4>
                            <PaymentStatusDisplay status={project.vendorBills} label="Vendor Bills" />
                            <PaymentStatusDisplay status={project.pekerja} label="Pekerja" />
                            <PaymentStatusDisplay status={project.pelaksana} label="Pelaksana" />
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

// List View Component
const ProjectList: React.FC<{ projects: ProjectSummary[] }> = ({ projects }) => {
  return (
    <div className="space-y-4">
      {projects.map((project, index) => {
        const totalIncome = getTotalAmount(project.invoice);
        const totalOutcome = 
          getTotalAmount(project.vendorBills) +
          getTotalAmount(project.pekerja) +
          getTotalAmount(project.pelaksana);
        const balance = totalIncome - totalOutcome;

        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                    {project.projectName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {project.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Progress: {project.progress}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  RAB: {formatRupiah(project.RAB)}
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-green-600 dark:text-green-400">
                    <div className="font-medium">Income</div>
                    <div>{formatRupiah(totalIncome)}</div>
                  </div>
                  <div className="text-red-600 dark:text-red-400">
                    <div className="font-medium">Outcome</div>
                    <div>{formatRupiah(totalOutcome)}</div>
                  </div>
                </div>
                <div className={`mt-2 text-lg font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Balance: {formatRupiah(balance)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// View type selector component
const ViewTypeSelector: React.FC<{
  viewType: string;
  onViewTypeChange: (type: 'card' | 'table' | 'list') => void;
}> = ({ viewType, onViewTypeChange }) => {
  const viewTypes = [
    { key: 'card' as const, label: 'Card', icon: '🧩' },
    { key: 'table' as const, label: 'Table', icon: '📊' },
    { key: 'list' as const, label: 'List', icon: '📋' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {viewTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => onViewTypeChange(type.key)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
              viewType === type.key
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="mr-2">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Category Filter Component
const CategoryFilter: React.FC<{
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="mb-3 font-semibold text-gray-800 dark:text-white">Filter by Category:</div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
              selectedCategory === cat
                ? 'bg-gray-800 dark:bg-gray-700 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ProjectSummaryDashboard() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewType, setViewType] = useState<'card' | 'table' | 'list'>('card');

  useEffect(() => {
    fetch('/api/project/summary')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((data: ApiResponse) => {
        if (data.success) {
          setProjects(data.data);
        } else {
          throw new Error('API returned error');
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const renderProjects = () => {
    switch (viewType) {
      case 'card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        );
      case 'table':
        return <ProjectTable projects={filteredProjects} />;
      case 'list':
        return <ProjectList projects={filteredProjects} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Project Summary Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Last updated: {new Date().toLocaleString('id-ID')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {filteredProjects.length} project(s)
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* View Type Selector */}
      <ViewTypeSelector viewType={viewType} onViewTypeChange={setViewType} />

      {/* Projects Count */}
      <div className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
        Showing {filteredProjects.length} project(s)
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
      </div>

      {/* Projects Content */}
      {renderProjects()}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedCategory === 'All' 
              ? "There are no projects in the system." 
              : `No projects found for category "${selectedCategory}".`}
          </p>
        </div>
      )}
    </div>
  );
}