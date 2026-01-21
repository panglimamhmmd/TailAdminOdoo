import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface Task {
  id: number;
  name: string;
  stage_id?: [number, string];
  date_deadline?: string;
  x_studio_persentase?: number;
  priority?: string;
  x_studio_progress?: number;
  x_studio_bobot?: number;
  date_assign?: string;
}

interface ProjectTaskTableProps {
  tasks: Task[];
  onUpdateTask: () => void;
}

export const ProjectTaskTable: React.FC<ProjectTaskTableProps> = ({ tasks, onUpdateTask }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleFocus = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.x_studio_persentase?.toString() || "0");
  };

  const handleBlur = async () => {
    if (editingId === null) return;
    
    const task = tasks.find(t => t.id === editingId);
    if (!task) return;

    const newValue = parseFloat(editValue);
    
    // If value hasn't changed, just exit edit mode
    if (newValue === task.x_studio_persentase) {
        setEditingId(null);
        return;
    }

    setUpdatingId(editingId);
    setEditingId(null); // Exit edit mode immediately for UI responsiveness

    try {
        const res = await fetch('/api/updateTask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                taskId: task.id,
                vals: { x_studio_persentase: newValue }
            })
        });

        if (res.ok) {
            onUpdateTask(); // Trigger refresh
        } else {
            console.error("Failed to update task");
            // Optionally revert UI or show toast
        }
    } catch (error) {
        console.error("Error updating task:", error);
    } finally {
        setUpdatingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleBlur();
      }
  };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Task Name</th>
              <th className="px-6 py-4 font-medium">Start Date</th>
              <th className="px-6 py-4 font-medium">End Date</th>
              <th className="px-6 py-4 font-medium text-right">Bobot (%)</th>
              <th className="px-6 py-4 font-medium text-right">Progress (Contribution)</th>
              <th className="px-6 py-4 font-medium text-right">Persentase (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No tasks found.
                    </td>
                </tr>
            ) : tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {task.name}
                  {task.priority === "1" && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      High
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {task.date_assign || "-"}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {task.date_deadline || "-"}
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                  {task.x_studio_bobot !== undefined ? `${((task.x_studio_bobot || 0) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                  {task.x_studio_progress !== undefined ? `${((task.x_studio_progress || 0) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {updatingId === task.id && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                    
                    {editingId === task.id ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-20 px-2 py-1 text-right text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    ) : (
                        <div 
                            onClick={() => handleFocus(task)}
                            className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-w-[3rem] text-right"
                            title="Click to edit"
                        >
                            <span className={`font-semibold ${
                                (task.x_studio_persentase || 0) === 100 ? 'text-green-600' : 
                                (task.x_studio_persentase || 0) > 0 ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                                {task.x_studio_persentase || 0}%
                            </span>
                        </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
