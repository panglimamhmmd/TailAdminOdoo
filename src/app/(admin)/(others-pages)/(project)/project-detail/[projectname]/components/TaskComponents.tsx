// components/TasksSection.tsx
import React from "react";
import type { ProjectTask } from "../types";
import { formatDate, getStatusColor, getProgressColor } from "../utils/formatters";

interface TasksSectionProps {
  tasks: ProjectTask[];
  tasksCount: number;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  tasksCount,
}) => {
  if (tasks.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          📋 Tasks ({tasksCount})
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          No tasks available
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        📋 Tasks ({tasksCount})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400/50 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-gray-900 dark:text-gray-100 font-medium text-sm line-clamp-2 flex-1">
                {task.name}
              </p>
              
              {task.stage_id && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ml-2 ${getStatusColor(
                    task.stage_id[1]
                  )}`}
                >
                  {task.stage_id[1]}
                </span>
              )}
            </div>

            <div className="space-y-1 mt-3">
              {task.date_deadline && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  📅 Due: {formatDate(task.date_deadline)}
                </p>
              )}

              {task.x_studio_persentase !== undefined &&
                task.x_studio_persentase !== null && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {task.x_studio_persentase}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${getProgressColor(
                          task.x_studio_persentase
                        )}`}
                        style={{ width: `${task.x_studio_persentase}%` }}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksSection;