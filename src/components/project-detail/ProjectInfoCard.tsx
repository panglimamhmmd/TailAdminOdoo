import React from 'react';
import { SubProject } from '@/types/project';

interface ProjectInfoCardProps {
  currentSubProject: SubProject;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeColor: (type: string) => string;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({ currentSubProject, getTypeIcon, getTypeColor }) => {
  return (
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
  );
};

export const ClientInfoCard: React.FC<{ currentSubProject: SubProject }> = ({ currentSubProject }) => {
  return (
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
  );
};
