"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  Clock, 
  Users
} from "lucide-react";

interface Task {
  id: number;
  name: string;
  stage_id?: [number, string];
  date_deadline?: string;
  x_studio_persentase?: number;
  priority?: string;
}

interface ProjectDetailData {
  project: {
    id: number;
    name: string;
    partner_id?: [number, string];
    x_progress_project?: number;
    date?: string;
  } | null;
  pic_names: string[];
  tasks: Task[];
}

export default function DesignProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectName = decodeURIComponent(params.projectName as string);
  
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State - Moved to top to prevent "Rendered fewer hooks than expected" error
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projectdetail/${encodeURIComponent(projectName)}`);
        
        if (!res.ok) throw new Error("Failed to fetch project details");
        
        const json = await res.json();
        if (json.success && json.projects && json.projects.length > 0) {
          setData(json.projects[0]);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [projectName]);

  if (loading) return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse">
      <div className="h-40 bg-gray-100 rounded-2xl mb-8"></div>
      <div className="space-y-4">
         <div className="h-20 bg-gray-100 rounded-lg"></div>
         <div className="h-20 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-center">
      <div className="p-4 bg-red-50 text-red-600 rounded-lg inline-block">
        {error}
      </div>
    </div>
  );

  if (!data) return null;

  // Process Tasks for Timeline
  // Sort: Done (bottom) -> In Progress (middle) -> New (top)? 
  // OR Timeline: Oldest first? 
  // Standard Timeline: Chronological by Deadline or Creation.
  // Let's sort by: 
  // 1. Incomplete First (In Progress -> New) 
  // 2. Then Deadline ASC
  // But Milestone view usually puts "Next Up" at top or distinct.
  // Let's just sort by Deadline ASC for a "Roadmap" feel.
  
  const sortedTasks = [...data.tasks].sort((a, b) => {
     // Sort by ID Ascending (Creation Order)
     return a.id - b.id;
  });

  const getTaskStatusColor = (stage?: string, percentage = 0) => {
    const s = (stage || "").toLowerCase();
    if (s.includes("done") || percentage === 100) return "green";
    if (s.includes("progress")) return "blue";
    if (s.includes("cancel")) return "red";
    return "gray";
  };



  const handleOpenModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleConfirmDone = async () => {
    if (!selectedTask) return;
    setProcessing(true);
    try {
        const res = await fetch('/api/markTaskDone', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ taskId: selectedTask.id })
        });
        
        if (!res.ok) throw new Error("Failed to update task");
        
        // Refresh Data
        const resDetail = await fetch(`/api/projectdetail/${encodeURIComponent(projectName)}`);
        const json = await resDetail.json();
        if (json.success && json.projects && json.projects.length > 0) {
            setData(json.projects[0]);
        }
        
    } catch (e) {
        console.error(e);
        alert("Failed to mark as done");
    } finally {
        setProcessing(false);
        setIsModalOpen(false);
        setSelectedTask(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-8">
      
      {/* ... Headers ... */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
          {data.project?.name}
        </h1>
      </div>

     {/* Info Card ... */}
     <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-10 flex flex-col md:flex-row gap-6 md:items-center">
        {/* ... Info Card Content (Same as before) ... */}
        {/* Customer */}
        <div className="flex-1">
          <p className="text-xs uppercase font-semibold text-gray-400 mb-2">Customer</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
               <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.project?.partner_id?.[1] || "Unknown Client"}
              </p>
              <p className="text-xs text-gray-500">Global Customer</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-gray-100 dark:bg-gray-700 mx-2"></div>

        {/* PICs */}
        <div className="flex-1">
           <p className="text-xs uppercase font-semibold text-gray-400 mb-2">PIC</p>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Users className="w-5 h-5" />
             </div>
             <div>
                {data.pic_names.length > 0 ? (
                  <div className="flex flex-col">
                    {data.pic_names.map((name, i) => (
                      <span key={i} className="text-sm font-medium text-gray-900 dark:text-white">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">Unassigned</span>
                )}
             </div>
           </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-gray-100 dark:bg-gray-700 mx-2"></div>

        {/* Progress & Due Date */}
        <div className="flex-1 min-w-[200px]">
           <p className="text-xs uppercase font-semibold text-gray-400 mb-2">Overall Progress</p>
           <div className="flex items-center justify-between mb-1">
             <span className="text-xl font-bold text-blue-600">{Math.round((data.project?.x_progress_project || 0) * 100)}%</span>
             <span className="text-xs text-gray-500 flex items-center">
               <Clock className="w-3 h-3 mr-1" />
               {data.project?.date || "No Deadline"}
             </span>
           </div>
           <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-600 rounded-full" 
               style={{ width: `${(data.project?.x_progress_project || 0) * 100}%` }} 
             />
           </div>
        </div>
      </div>

      {/* Timeline Section */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Workflow Stages</h2>
      
      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3.5 space-y-10 pb-10">
        {sortedTasks.length === 0 ? (
          <div className="pl-8 text-gray-500">No tasks found</div>
        ) : (
          sortedTasks.map((task) => {
            const statusColor = getTaskStatusColor(task.stage_id?.[1], task.x_studio_persentase);
            const isDone = statusColor === 'green';
            const isInProgress = statusColor === 'blue';
            
            return (
              <div key={task.id} className="relative pl-8">
                {/* Timeline Node */}
                <div className={`
                  absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 
                  ${isDone ? 'bg-green-500' : isInProgress ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}></div>

                {/* Content Card */}
                <div className={`
                    p-5 rounded-xl border transition-all duration-200
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
                               ? 'bg-green-100 text-green-700' 
                               : isInProgress 
                                 ? 'bg-blue-100 text-blue-700' 
                                 : 'bg-gray-100 text-gray-600'
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
                        <h3 className={`text-lg font-bold ${isDone ? 'text-gray-600 line-through decoration-gray-400 decoration-2' : 'text-gray-900 dark:text-white'}`}>
                          {task.name}
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
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenModal(task)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-green-50 hover:border-green-500 hover:text-green-600 flex items-center justify-center transition-all shadow-sm"
                            title="Mark as Done"
                          >
                            <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-green-600" />
                          </button>
                        )}
                     </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl transform transition-all scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mark as Done?</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Are you sure you want to mark <strong>&quot;{selectedTask?.name}&quot;</strong> as completed? This will update the stage to &quot;Done&quot;.
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmDone}
                            disabled={processing}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
