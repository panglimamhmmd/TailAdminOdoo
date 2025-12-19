import React, { useMemo } from 'react';
import { SubProject } from '@/types/project';

interface TaskProgressCardProps {
  currentSubProject: SubProject;
}

export const TaskProgressCard: React.FC<TaskProgressCardProps> = ({ currentSubProject }) => {
  const completion = useMemo(() => {
    const tasks = currentSubProject.tasks;
    if (!tasks || tasks.length === 0) {
      return {
        simplePercentage: 0,
        weightedPercentage: 0,
        completedCount: 0,
        totalCount: 0
      };
    }

    const totalTasks = tasks.length;
    
    // x_studio_persentase is completion status (100 = done)
    const completedTasks = tasks.filter(task => (task.x_studio_persentase ?? 0) === 100).length;
    
    // Simple percentage
    const simplePercentage = (completedTasks / totalTasks) * 100;
    
    // Weighted percentage: sum of (bobot * progress) ? 
    // The original code was summing up x_studio_progress directly as weighted percentage.
    // Assuming x_studio_progress is the contribution to total project progress.
    const weightedPercentage = tasks.reduce((sum, task) => {
      return sum + (task.x_studio_progress ?? 0);
    }, 0);

    return {
      simplePercentage: Math.round(simplePercentage * 100) / 100,
      weightedPercentage: Math.round(weightedPercentage * 100) / 100, // Fixed rounding from original
      completedCount: completedTasks,
      totalCount: totalTasks
    };
  }, [currentSubProject.tasks]);

  return (
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
              style={{ width: `${Math.min(completion.weightedPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
