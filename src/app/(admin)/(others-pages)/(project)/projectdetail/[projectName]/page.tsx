'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface FinanceGroup {
  journal_id: [number, string];
  status_in_payment: string;
  amount_total: number;
  __count: number;
}

interface FinanceSummary {
  totalAmount: number;
  totalInvoices: number;
  byStatus: Record<string, number>;
  byJournal: Record<string, number>;
}

interface Task {
  id: number;
  name: string;
  x_studio_persentase?: number;
  x_studio_bobot?: number;
  x_studio_progress?: number;
}

interface Client {
  name: string;
}

interface ProjectDetails {
  id: number;
  name: string;
  date_start?: string;
  date?: string;
  user_id?: [number, string];
  partner_id?: [number, string];
  tag_ids: number[];
  x_studio_related_field_180_1j3l9t4is?: number;
  x_progress_project?: number;

}

interface SubProject {
  id: number;
  soCode: string;
  type: 'construction' | 'design' | 'interior' | 'other';
  fullName: string;
  details: ProjectDetails | null;
  finances: {
    groups: FinanceGroup[];
    summary: FinanceSummary;
  };
  tasks: Task[];
  client: Client | null;
}

interface ProjectData {
  success: boolean;
  projectName: string;
  subProjects: SubProject[];
  count: number;
}

export default function ProjectDashboard() {
  const params = useParams();
  const projectName = decodeURIComponent(params.projectName as string);
  
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isTasksOpen, setIsTasksOpen] = React.useState(false);


  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/project/projectdetails/${encodeURIComponent(projectName)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }
        
        const result: ProjectData = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (projectName) {
      fetchProjectData();
    }
  }, [projectName]);


  // const getStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case 'paid':
  //       return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20';
  //     case 'draft':
  //       return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20';
  //     case 'unpaid':
  //       return 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20';
  //     default:
  //       return 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20';
  //   }
  // };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'design':
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
      case 'construction':
        return 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400';
      case 'interior':
        return 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'design':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'construction':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'interior':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-scree p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="h-96 bg-white dark:bg-gray-900 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-rose-900 dark:text-rose-400 mb-1">Error Loading Project</h3>
                <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const currentSubProject = data.subProjects[activeTab];

const formatRupiah = (value: number | undefined | null): string => {
  if (!value && value !== 0) return 'N/A';
  return `Rp ${value.toLocaleString('id-ID')}`;
};

// Update getFieldByType biar return number
const getFieldByType = (type: string, field: string): number | undefined => {
  const project = data?.subProjects.find(p => p.type === type);
  return project?.details?.[field as keyof ProjectDetails] as number | undefined;
};

  const getTotalBudget = () => {
  if (!data?.subProjects) return 0;
  
  return data.subProjects.reduce((total, project) => {
    const budget = project.details?.x_studio_related_field_180_1j3l9t4is || 0;
    return total + budget;
  }, 0);
};


// Update function untuk accept optional properties
function calculateTaskCompletionPercentage(tasks: Task[]) {
  if (!tasks || tasks.length === 0) {
    return {
      simplePercentage: 0,
      weightedPercentage: 0,
      completedCount: 0,
      totalCount: 0
    };
  }

  const totalTasks = tasks.length;
  
  // ✅ FIX: Pakai x_studio_persentase, bukan x_studio_progress
  const completedTasks = tasks.filter(task => (task.x_studio_persentase ?? 0) === 100).length;
  
  // Simple percentage: count completed / total
  const simplePercentage = (completedTasks / totalTasks) * 100;
  
  // Weighted percentage: sum of (bobot × progress)
  const weightedPercentage = tasks.reduce((sum, task) => {
    return sum + (task.x_studio_progress ?? 0);
  }, 0);
  
  // ✅ Total progress dari semua task (jumlahkan semua persentase)
  const totalProgress = tasks.reduce((sum, task) => {
    return sum + (task.x_studio_persentase ?? 0);
  }, 0) / totalTasks;

  return {
    simplePercentage: Math.round(simplePercentage * 100) / 100,
    weightedPercentage: Math.round(weightedPercentage * 100) ,
    totalProgress: Math.round(totalProgress * 100) / 100, // Total persentase semua task
    completedCount: completedTasks,
    totalCount: totalTasks
  };
}
// Usage
const completion = calculateTaskCompletionPercentage(currentSubProject.tasks);
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-  7xl p-4 md:p-6 lg:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">Dashboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 dark:text-white font-medium">Project Details</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{data.projectName}</h1>
          {/* <p className="text-gray-600 dark:text-gray-400">Managing {data.count} sub-project{data.count > 1 ? 's' : ''} across different phases</p> */}
        </div>

        {/* Quick Stats - Compact */}
<div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Design Card */}
  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:scale-101 transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-lg group-hover:scale-110 transition-transform">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </div>
      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Design</span>
    </div>
    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
      {formatRupiah(getFieldByType('design', 'x_studio_related_field_180_1j3l9t4is'))}
    </div>
    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">RAB Design</div>
  </div>

  {/* Construction Card */}
  <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-2xl p-5 border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl hover:scale-101 transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-lg group-hover:scale-110 transition-transform">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">Construction</span>
    </div>
    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
      {formatRupiah(getFieldByType('construction', 'x_studio_related_field_180_1j3l9t4is'))}
    </div>
    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">RAB Construction</div>
  </div>

  {/* Interior Card */}
  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl p-5 border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:scale-101 transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
      <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Interior</span>
    </div>
    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
      {formatRupiah(getFieldByType('interior', 'x_studio_related_field_180_1j3l9t4is'))}
    </div>
    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">RAB Interior</div>
  </div>

  {/* Total Card - Green Theme */}
    <div className="group bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/30 rounded-2xl p-5 border-2 border-emerald-300 dark:border-emerald-700 hover:shadow-xl hover:scale-101 transition-all duration-300 relative overflow-hidden">
      {/* Animated background shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Total RAB</span>
        </div>
        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
          {formatRupiah(getTotalBudget())}
        </div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total RAB Project</div>
      </div>
    </div>
</div>

        {/* !! tab 2 */}
          {/* <div className="mb-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{data.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sub Projects</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{currentSubProject?.tasks.length || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Tasks</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{currentSubProject?.finances.summary.totalInvoices || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Invoices</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {((Object.values(currentSubProject?.finances.summary.byStatus || {}).reduce((a, b) => a + b, 0) / (currentSubProject?.finances.summary.totalAmount || 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
            </div>
          </div> */}

        {/* Tabs - Modern Style */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-1.5 border border-gray-200 dark:border-gray-800 inline-flex gap-1">
            {data.subProjects.map((subProject, index) => (
              <button
                key={subProject.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === index
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className={`${activeTab === index ? '' : 'opacity-60'}`}>
                  {getTypeIcon(subProject.type)}
                </span>
                <span>{subProject.soCode}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                  activeTab === index 
                    ? 'bg-white/20 dark:bg-gray-900/30 text-white dark:text-gray-900'
                    : getTypeColor(subProject.type)
                }`}>
                  {subProject.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {currentSubProject && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Project Info & Client */}
            <div className="space-y-6">
              
              {/* Project Info Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 rounded-xl ${getTypeColor(currentSubProject.type)}`}>
                    {getTypeIcon(currentSubProject.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Project Info</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Basic details</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{currentSubProject.fullName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
                      <div className="text-sm text-gray-900 dark:text-white">{currentSubProject.details?.date_start || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</div>
                      <div className="text-sm text-gray-900 dark:text-white">{currentSubProject.details?.date || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project Manager</div>
                    <div className="text-sm text-gray-900 dark:text-white">{currentSubProject.details?.user_id?.[1] || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Client Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Client</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Project owner</p>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentSubProject.client?.name || 'N/A'}
                </div>
              </div>

              {/* Task Progression */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-900/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Task Progress</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{currentSubProject.type}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Completion Stats */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-orange-900 dark:text-orange-400">
            {completion.completedCount}
          </span>
          <span className="text-lg text-gray-600 dark:text-gray-400">
            / {completion.totalCount} Tasks
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="font-semibold text-orange-900 dark:text-orange-400">
              {completion.weightedPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completion.weightedPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Additional Stats */}
        {/* <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {completion.simplePercentage}%
            </div>
          </div>
          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Progress</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {completion.totalProgress}% 
            </div>
          </div>
        </div> */}
      </div>
             </div>

            </div>

            {/* Middle & Right Columns - Finance & Tasks */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Financial Overview */}
              {/* <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Financial Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Invoice summary and payment status</p>
                </div>
                
                <div className="p-6">
        
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-5 mb-5 border border-emerald-200 dark:border-emerald-900/50">
                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Total Amount</div>
                    <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">
                      Rp {currentSubProject.finances.summary.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      {currentSubProject.finances.summary.totalInvoices} invoices
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {Object.entries(currentSubProject.finances.summary.byStatus).map(([status, amount]) => (
                      <div key={status} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium mb-2 ${getStatusColor(status)}`}>
                          {status}
                        </span>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          Rp {amount.toLocaleString('id-ID', { notation: 'compact', compactDisplay: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Journal</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {currentSubProject.finances.groups.map((group, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{group.journal_id[1]}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(group.status_in_payment)}`}>
                                {group.status_in_payment}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                              Rp {group.amount_total.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">
                              {group.__count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div> */}

{/* New Finance */}
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
                      <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">
                        Rp {(() => {
                          const income = currentSubProject.finances.groups
                            .filter(g => g.journal_id[0] === 8)
                            .reduce((sum, g) => sum + g.amount_total, 0);
                          return income.toLocaleString();
                        })()}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        {currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8).reduce((sum, g) => sum + g.__count, 0)} invoices
                      </div>
                    </div>

                    {/* Outcome */}
                    <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-xl p-5 border border-rose-200 dark:border-rose-900/50">
                      <div className="text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">Outcome</div>
                      <div className="text-2xl font-bold text-rose-900 dark:text-rose-400">
                        Rp {(() => {
                          const outcome = currentSubProject.finances.groups
                            .filter(g => [9, 15, 16].includes(g.journal_id[0]))
                            .reduce((sum, g) => sum + g.amount_total, 0);
                          return outcome.toLocaleString();
                        })()}
                      </div>
                      <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                        {currentSubProject.finances.groups.filter(g => [9, 15, 16].includes(g.journal_id[0])).reduce((sum, g) => sum + g.__count, 0)} bills
                      </div>
                    </div>

                    {/* Balance */}
                    <div className={`rounded-xl p-5 border ${(() => {
                      const income = currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8).reduce((sum, g) => sum + g.amount_total, 0);
                      const outcome = currentSubProject.finances.groups.filter(g => [9, 15, 16].includes(g.journal_id[0])).reduce((sum, g) => sum + g.amount_total, 0);
                      const balance = income - outcome;
                      return balance >= 0 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900/50'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900/50';
                    })()}`}>
                      <div className={`text-sm font-medium mb-1 ${(() => {
                        const income = currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8).reduce((sum, g) => sum + g.amount_total, 0);
                        const outcome = currentSubProject.finances.groups.filter(g => [9, 15, 16].includes(g.journal_id[0])).reduce((sum, g) => sum + g.amount_total, 0);
                        return income - outcome >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300';
                      })()}`}>Balance</div>
                      <div className={`text-2xl font-bold ${(() => {
                        const income = currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8).reduce((sum, g) => sum + g.amount_total, 0);
                        const outcome = currentSubProject.finances.groups.filter(g => [9, 15, 16].includes(g.journal_id[0])).reduce((sum, g) => sum + g.amount_total, 0);
                        return income - outcome >= 0 ? 'text-blue-900 dark:text-blue-400' : 'text-amber-900 dark:text-amber-400';
                      })()}`}>
                        Rp {(() => {
                          const income = currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8).reduce((sum, g) => sum + g.amount_total, 0);
                          const outcome = currentSubProject.finances.groups.filter(g => [9, 15, 16].includes(g.journal_id[0])).reduce((sum, g) => sum + g.amount_total, 0);
                          return Math.abs(income - outcome).toLocaleString();
                        })()}
                      </div>
                      <div className={`text-xs mt-1 ${(() => {
                        const income = currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8).reduce((sum, g) => sum + g.amount_total, 0);
                        const outcome = currentSubProject.finances.groups.filter(g => [9, 15, 16].includes(g.journal_id[0])).reduce((sum, g) => sum + g.amount_total, 0);
                        return income - outcome >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400';
                      })()}`}>
                        {(() => {
                          const income = currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8).reduce((sum, g) => sum + g.amount_total, 0);
                          const outcome = currentSubProject.finances.groups.filter(g => [9, 15, 16].includes(g.journal_id[0])).reduce((sum, g) => sum + g.amount_total, 0);
                          return income - outcome >= 0 ? 'Surplus' : 'Deficit';
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Outcome Breakdown */}
                {/* Outcome Details */}
<div className="mb-6">
  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Outcome Details</h4>
  {/* ✅ Tambahkan wrapper dengan overflow-x-auto */}
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
          {[
            { id: 9, name: 'Vendor Bills' },
            { id: 15, name: 'Pelaksana' },
            { id: 16, name: 'Tukang' }
          ].map(category => {
            const items = currentSubProject.finances.groups.filter(g => g.journal_id[0] === category.id);
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
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right whitespace-nowrap">
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

{/* Income Breakdown */}
<div>
  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Income Details</h4>
  {/* ✅ Tambahkan wrapper dengan overflow-x-auto */}
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
          {(() => {
            const items = currentSubProject.finances.groups.filter(g => g.journal_id[0] === 8);
            const paid = items.filter(g => g.status_in_payment === 'paid').reduce((sum, g) => sum + g.amount_total, 0);
            const notPaid = items.filter(g => g.status_in_payment === 'not_paid').reduce((sum, g) => sum + g.amount_total, 0);
            const partial = items.filter(g => g.status_in_payment === 'partial').reduce((sum, g) => sum + g.amount_total, 0);
            const draft = items.filter(g => g.status_in_payment === 'draft').reduce((sum, g) => sum + g.amount_total, 0);
            const total = items.reduce((sum, g) => sum + g.amount_total, 0);
            
            return (
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">Invoices</td>
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-500 text-right whitespace-nowrap">
                  Rp {draft.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right whitespace-nowrap">
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
          })()}
        </tbody>
      </table>
    </div>
  </div>
</div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Tasks</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentSubProject.tasks.length} total tasks</p>
          </div>
          <button
            onClick={() => setIsTasksOpen(!isTasksOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {isTasksOpen ? 'Hide Tasks' : 'Show Tasks'}
            <svg 
              className={`w-4 h-4 transition-transform ${isTasksOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {isTasksOpen && (
        <div className="p-6">
          {currentSubProject.tasks.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50 z-10">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Task Name</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Persentase</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Bobot</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {currentSubProject.tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{task.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right font-mono">
                          {task.x_studio_persentase !== undefined && task.x_studio_persentase !== null
                            ? task.x_studio_persentase.toFixed(3)
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right font-mono">
                          {task.x_studio_bobot !== undefined && task.x_studio_bobot !== null
                            ? task.x_studio_bobot.toFixed(3)
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium font-mono ${
                            (task.x_studio_progress ?? 0) === 100
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20'
                              : (task.x_studio_progress ?? 0) > 0
                              ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/20'
                          }`}>
                            {task.x_studio_progress !== undefined && task.x_studio_progress !== null
                              ? task.x_studio_progress.toFixed(3)
                              : '-'}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks available</p>
            </div>
          )}
        </div>
      )}
    </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}