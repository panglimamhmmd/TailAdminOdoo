'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  PenTool, 
  HardHat, 
  Armchair, 
  Package, 
  AlertCircle,
  LayoutDashboard,
  ChevronRight,
  
} from 'lucide-react';
import { ProjectData } from '@/types/project';
import { ProjectStats } from '@/components/project-detail/ProjectStats';
import { FinanceOverview } from '@/components/project-detail/FinanceOverview';
import { TaskList } from '@/components/project-detail/TaskList';

// Configuration for project types
const PROJECT_TYPE_CONFIG: Record<string, { 
  icon: React.ElementType, 
  color: string, 
  bg: string 
}> = {
  design: { 
    icon: PenTool, 
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20'
  },
  construction: { 
    icon: HardHat, 
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20'
  },
  interior: { 
    icon: Armchair, 
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20'
  },
  other: { 
    icon: Package, 
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20'
  }
};

export default function ProjectDashboard() {
  const params = useParams();
  // Safe decoding of project name
  const projectName = typeof params.projectName === 'string' 
    ? decodeURIComponent(params.projectName) 
    : '';
  
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!projectName) return;

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

    fetchProjectData();
  }, [projectName]);

  const getTypeColor = (type: string) => {
    const config = PROJECT_TYPE_CONFIG[type] || PROJECT_TYPE_CONFIG.other;
    return `${config.bg} ${config.color}`;
  };

  const getTypeIcon = (type: string) => {
    const config = PROJECT_TYPE_CONFIG[type] || PROJECT_TYPE_CONFIG.other;
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
        <div className="mx-auto max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-2 items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 animate-pulse" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] p-4 md:p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-500/20 p-8 shadow-xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 mb-6">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Project</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentSubProject = data.subProjects[activeTab];

  // --- Helper: Schedule Health Calculation ---
  const getScheduleHealth = (details: { date_start?: string; date?: string; x_progress_project?: number } | undefined) => {
    if (!details?.date_start || !details?.date) return null;
    const start = new Date(details.date_start);
    const end = new Date(details.date);
    const now = new Date();
    
    if (now < start) return { status: 'Not Started', color: 'text-gray-500 bg-gray-100' };
    if (now > end) return { status: 'Completed', color: 'text-emerald-600 bg-emerald-100' };

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const expectedProgress = (elapsed / totalDuration) * 100;
    const actualProgress = details.x_progress_project || 0;

    const variance = actualProgress - expectedProgress;

    if (variance < -10) return { status: 'Behind Schedule', color: 'text-rose-600 bg-rose-100' };
    if (variance > 5) return { status: 'Ahead of Schedule', color: 'text-emerald-600 bg-emerald-100' };
    return { status: 'On Track', color: 'text-blue-600 bg-blue-100' };
  };

  const scheduleStatus = getScheduleHealth(currentSubProject?.details);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-2 md:p-6 lg:p-8">
        
        {/* Header - Enhanced with Metadata */}
        <div className="mb-8 bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              Project Details
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                {data.projectName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-medium">
                {currentSubProject.fullName}
              </p>
              
              {/* Metadata Grid */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
                <div className="flex flex-col gap-1">
                   <span className="text-gray-500 dark:text-gray-400 font-medium">Project Manager</span>
                   <span className="text-gray-900 dark:text-white font-semibold">
                     {Array.isArray(currentSubProject?.details?.user_id) 
                        ? currentSubProject.details.user_id[1] 
                        : 'Unassigned'}
                   </span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-gray-500 dark:text-gray-400 font-medium">Client</span>
                   <span className="text-gray-900 dark:text-white font-semibold">
                     {Array.isArray(currentSubProject?.details?.partner_id) 
                        ? currentSubProject.details.partner_id[1] 
                        : 'Unknown Client'}
                   </span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-gray-500 dark:text-gray-400 font-medium">Timeline</span>
                   <span className="text-gray-900 dark:text-white font-semibold">
                      {currentSubProject?.details?.date_start || 'N/A'} — {currentSubProject?.details?.date || 'N/A'}
                   </span>
                </div>
              </div>
            </div>

            {/* Schedule Status Badge & Progress */}
            <div className="flex flex-col items-end gap-3">
              {scheduleStatus && (
                 <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-sm ${scheduleStatus.color}`}>
                   <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                   {scheduleStatus.status}
                 </div>
              )}
              {currentSubProject.details?.x_progress_project !== undefined && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(currentSubProject.details.x_progress_project).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completion</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <ProjectStats subProjects={data.subProjects} getTypeIcon={getTypeIcon} />

        {/* Tabs - Modern & Clean */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-1.5 border border-gray-200 dark:border-gray-800 inline-flex gap-1 min-w-max shadow-sm">
            {data.subProjects.map((subProject, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={subProject.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-brand-200 dark:ring-transparent'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className={`${isActive ? 'scale-110' : 'opacity-70'} transition-transform`}>
                    {getTypeIcon(subProject.type)}
                  </span>
                  <span>{subProject.soCode}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    isActive 
                      ? getTypeColor(subProject.type) // uses bg/color from config
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {subProject.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid - Animated Entry - Stacked Layout */}
        {currentSubProject && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Finance Section */}
            <FinanceOverview currentSubProject={currentSubProject} />
            
            {/* Tasks Section */}
            <TaskList currentSubProject={currentSubProject} />
          </div>
        )}

      </div>
    </div>
  );
}