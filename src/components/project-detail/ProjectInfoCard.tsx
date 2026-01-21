import React from 'react';
import { SubProject } from '@/types/project';

interface ProjectInfoCardProps {
  currentSubProject: SubProject;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeColor: (type: string) => string;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({ currentSubProject, getTypeIcon, getTypeColor }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl ${getTypeColor(currentSubProject.type)}`}>
          {getTypeIcon(currentSubProject.type)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Project Info</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Key details</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</div>
          <div className="text-sm text-gray-900 dark:text-white font-medium">{currentSubProject.fullName}</div>
        </div>

        {/* Dates */}
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

        {/* PM & Client Combined - Optimized for Mobile */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project Manager</div>
              <div className="text-sm text-gray-900 dark:text-white">{currentSubProject.details?.user_id?.[1] || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client</div>
              <div className="text-sm text-gray-900 dark:text-white">{currentSubProject.client?.name || 'N/A'}</div>
            </div>
        </div>
      </div>
    </div>
  );
};
