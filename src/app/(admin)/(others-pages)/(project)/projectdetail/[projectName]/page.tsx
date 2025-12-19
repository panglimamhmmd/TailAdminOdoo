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
  Loader2
} from 'lucide-react';
import { ProjectData } from '@/types/project';
import { ProjectStats } from '@/components/project-detail/ProjectStats';
import { ProjectInfoCard, ClientInfoCard } from '@/components/project-detail/ProjectInfoCard';
import { TaskProgressCard } from '@/components/project-detail/TaskProgressCard';
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

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        
        {/* Header - Enhanced */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              Project Details
            </span>
          </nav>
          <div className="flex items-start justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {data.projectName}
            </h1>
          </div>
        </div>

        {/* Quick Stats */}
        <ProjectStats subProjects={data.subProjects} getTypeIcon={getTypeIcon} />

        {/* Tabs - Modern & Clean */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200 dark:border-gray-800 inline-flex gap-1 min-w-max">
            {data.subProjects.map((subProject, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={subProject.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className={`${isActive ? 'text-blue-600 dark:text-blue-400 scale-110' : 'opacity-60'} transition-transform`}>
                    {getTypeIcon(subProject.type)}
                  </span>
                  <span>{subProject.soCode}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${
                    isActive 
                      ? getTypeColor(subProject.type)
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {subProject.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid - Animated Entry */}
        {currentSubProject && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column */}
            <div className="space-y-6">
              <ProjectInfoCard 
                currentSubProject={currentSubProject} 
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
              />
              <ClientInfoCard currentSubProject={currentSubProject} />
              <TaskProgressCard currentSubProject={currentSubProject} />
            </div>

            {/* Middle & Right Columns */}
            <div className="lg:col-span-2 space-y-6">
              <FinanceOverview currentSubProject={currentSubProject} />
              <TaskList currentSubProject={currentSubProject} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}