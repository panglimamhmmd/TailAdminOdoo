import React, { useState } from 'react';
import { SubProject } from '@/types/project';

interface TaskListProps {
  currentSubProject: SubProject;
}

export const TaskList: React.FC<TaskListProps> = ({ currentSubProject }) => {
  const [isTasksOpen, setIsTasksOpen] = useState(false);

  return (
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
  );
};
