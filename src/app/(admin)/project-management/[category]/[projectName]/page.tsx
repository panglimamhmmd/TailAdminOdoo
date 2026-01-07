"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ProjectTask {
  id: number;
  name: string;
  stage_id?: [number, string];
  user_ids?: number[];
  date_deadline?: string;
  priority?: string;
  x_studio_persentase?: number;
}

interface ProjectDetailData {
  project: {
    id: number;
    name: string;
    x_progress_project?: number;
  } | null;
  tasks: ProjectTask[];
}

export default function ProjectTaskPage() {
  const params = useParams();
  const projectName = decodeURIComponent(params.projectName as string);
  const category = params.category as string;
  
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Using the existing API which returns project details + tasks
        const res = await fetch(`/api/projectdetail/${encodeURIComponent(projectName)}`);
        if (!res.ok) throw new Error("Failed to fetch project details");
        
        const json = await res.json();
        if (json.success && json.projects && json.projects.length > 0) {
          setData(json.projects[0]); // Access first project result
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load project tasks");
      } finally {
        setLoading(false);
      }
    };

    if (projectName) {
      fetchDetails();
    }
  }, [projectName]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Tasks for {projectName}...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;
  if (!data) return null;

  const tasks = data.tasks || [];

  // Removed unused getPriorityColor

  const getStageColor = (stageName?: string) => {
    const s = (stageName || "").toLowerCase();
    if (s.includes("done") || s.includes("completed")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (s.includes("progress")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 2xl:px-10 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {data.project?.name}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="capitalize px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">{category}</span>
          <span>•</span>
          <span>{tasks.length} Tasks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No tasks found for this project.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                    {task.name}
                  </h4>
                  {task.priority === "1" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> High
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Due: {task.date_deadline || "No Deadline"}</span>
                  </div>
                  {task.x_studio_persentase !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{task.x_studio_persentase}%</span>
                      <span>completed</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(task.stage_id?.[1])}`}>
                  {task.stage_id?.[1] || "Unknown Stage"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
