
import React, { useState } from "react";
import {
  CheckCircle2, 
  ChevronDown, 
  Calendar, 
} from "lucide-react";
import { TimesheetList } from "./TimesheetList";

interface Task {
  id: number;
  name: string;
  stage_id?: [number, string];
  date_deadline?: string;
  x_studio_persentase?: number;
  priority?: string;
}

interface ProjectTimelineProps {
  tasks: Task[];
  onMarkDone: (task: Task) => void;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ tasks, onMarkDone }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const toggleTask = (id: number) => {
    setExpandedTaskId(prev => prev === id ? null : id);
  };

  const sortedTasks = [...tasks].sort((a, b) => a.id - b.id);

  const getTaskStatusColor = (stage?: string, percentage = 0) => {
    const s = (stage || "").toLowerCase();
    if (s.includes("done") || percentage === 100) return "green";
    if (s.includes("progress")) return "blue";
    if (s.includes("cancel")) return "red";
    return "gray";
  };

  return (
    <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3.5 space-y-10 pb-10">
      {sortedTasks.length === 0 ? (
        <div className="pl-8 text-gray-500 italic">No tasks found</div>
      ) : (
        sortedTasks.map((task) => {
          const statusColor = getTaskStatusColor(task.stage_id?.[1], task.x_studio_persentase);
          const isDone = statusColor === 'green';
          const isInProgress = statusColor === 'blue';
          const isExpanded = expandedTaskId === task.id;
          
          return (
            <div key={task.id} className="relative pl-8">
              {/* Timeline Node */}
              <div className={`
                absolute -left-[9px] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 
                ${isDone ? 'bg-green-500' : isInProgress ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
              `}></div>

              {/* Content Card */}
              <div 
                 onClick={() => toggleTask(task.id)}
                 className={`
                  group p-5 rounded-xl border transition-all duration-200 cursor-pointer
                  ${isExpanded ? 'ring-2 ring-blue-500/20 border-blue-400' : ''}
                  ${isInProgress 
                     ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm' 
                     : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }
              `}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                           isDone 
                             ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                             : isInProgress 
                               ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                               : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                         }`}>
                           {task.stage_id?.[1] || 'Unknown User'}
                         </span>
                         {task.date_deadline && (
                           <span className="text-xs text-gray-500 flex items-center">
                             <Calendar className="w-3 h-3 mr-1" />
                             {task.date_deadline}
                           </span>
                         )}
                      </div>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${isDone ? 'text-gray-600 line-through decoration-gray-400 decoration-2' : 'text-gray-900 dark:text-white'}`}>
                        {task.name}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </h3>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="text-right">
                         {task.x_studio_persentase !== undefined && (
                           <div className="flex flex-col items-end">
                             <span className={`text-sm font-bold ${isDone ? 'text-green-600' : isInProgress ? 'text-blue-600' : 'text-gray-500'}`}>
                               {task.x_studio_persentase}%
                             </span>
                             <span className="text-[10px] text-gray-400 uppercase">Complete</span>
                           </div>
                         )}
                      </div>
                      
                      {isDone ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onMarkDone(task); }}
                          className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-green-50 hover:border-green-500 hover:text-green-600 flex items-center justify-center transition-all shadow-sm"
                          title="Mark as Done"
                        >
                          <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-green-600" />
                        </button>
                      )}
                   </div>

                </div>

                {/* Timesheet Dropdown */}
                <TimesheetList taskId={task.id} isOpen={isExpanded} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
