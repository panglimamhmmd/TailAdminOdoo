import React from 'react';
import { SubProject } from '@/types/project';

interface ProjectStatsProps {
  subProjects: SubProject[];
  getTypeIcon: (type: string) => React.ReactNode;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ subProjects, getTypeIcon }) => {
  const getFieldByType = (type: string, field: string): number | undefined => {
    const project = subProjects.find(p => p.type === type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (project?.details as any)?.[field] as number | undefined;
  };

  const formatRupiah = (value: number | undefined | null): string => {
    if (!value && value !== 0) return 'N/A';
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getTotalBudget = () => {
    if (!subProjects) return 0;
    return subProjects.reduce((total, project) => {
      const budget = project.details?.x_studio_related_field_180_1j3l9t4is || 0;
      return total + budget;
    }, 0);
  };

  return (
    <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* Design Card */}
      <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl p-4 md:p-5 border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:scale-101 transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <div className="p-2 md:p-2.5 rounded-xl bg-blue-500 text-white shadow-lg group-hover:scale-110 transition-transform">
            {getTypeIcon('design')}
          </div>
          <span className="text-[10px] md:text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Design</span>
        </div>
        <div className="text-lg md:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1 truncate">
          {formatRupiah(getFieldByType('design', 'x_studio_related_field_180_1j3l9t4is'))}
        </div>
      <div className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium">RAB Design</div>
      </div>

      {/* Construction Card */}
      <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-2xl p-4 md:p-5 border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl hover:scale-101 transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <div className="p-2 md:p-2.5 rounded-xl bg-orange-500 text-white shadow-lg group-hover:scale-110 transition-transform">
            {getTypeIcon('construction')}
          </div>
          <span className="text-[10px] md:text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">Construction</span>
        </div>
        <div className="text-lg md:text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1 truncate">
          {formatRupiah(getFieldByType('construction', 'x_studio_related_field_180_1j3l9t4is'))}
        </div>
        <div className="text-[10px] md:text-xs text-orange-600 dark:text-orange-400 font-medium">RAB Construction</div>
      </div>

      {/* Interior Card */}
      <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl p-4 md:p-5 border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:scale-101 transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <div className="p-2 md:p-2.5 rounded-xl bg-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform">
            {getTypeIcon('interior')}
          </div>
          <span className="text-[10px] md:text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Interior</span>
        </div>
        <div className="text-lg md:text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1 truncate">
          {formatRupiah(getFieldByType('interior', 'x_studio_related_field_180_1j3l9t4is'))}
        </div>
        <div className="text-[10px] md:text-xs text-purple-600 dark:text-purple-400 font-medium">RAB Interior</div>
      </div>

      {/* Total Card - Green Theme */}
      <div className="group bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/30 rounded-2xl p-4 md:p-5 border-2 border-emerald-300 dark:border-emerald-700 hover:shadow-xl hover:scale-101 transition-all duration-300 relative overflow-hidden">
        {/* Animated background shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="relative">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-2 md:p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Total RAB</span>
          </div>
          <div className="text-lg md:text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1 truncate">
            {formatRupiah(getTotalBudget())}
          </div>
          <div className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total RAB Project</div>
        </div>
      </div>
    </div>
  );
};
