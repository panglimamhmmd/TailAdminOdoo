"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  ChevronLeft, 
  Plus,
} from "lucide-react";
import { DocumentList } from "@/components/project-detail/DocumentList";
import { EditProjectModal } from "@/components/project-detail/EditProjectModal";
import { AddTaskModal } from "@/components/project-detail/AddTaskModal";
import { ProjectHeader } from "@/components/project-detail/ProjectHeader";
import { ProjectTimeline } from "@/components/project-detail/ProjectTimeline";
import { ProjectTaskTable } from "@/components/project-detail/ProjectTaskTable";

// ======================
// Types
// ======================

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

interface ProjectDetailData {
  project: {
    id: number;
    name: string;
    partner_id?: [number, string];
    stage_id?: [number, string];
    x_progress_project?: number;
    date?: string;
    sale_order_id?: [number, string];
  } | null;
  pic_names: string[];
  pic_ids?: number[];
  tasks: Task[];
}

// ======================
// Main Page
// ======================

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectName = decodeURIComponent(params.projectName as string);
  const categoryParam = params.category;
  const category = typeof categoryParam === 'string' ? decodeURIComponent(categoryParam) : "Project";
  
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [processing, setProcessing] = useState(false);

  // Stage State
  const [stages, setStages] = useState<{id: number, name: string}[]>([]);
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    // Fetch Stages
    const fetchStages = async () => {
        try {
            const res = await fetch('/api/projectStages');
            const json = await res.json();
            if (json.success) setStages(json.stages);
        } catch (e) {
            console.error("Failed to fetch stages", e);
        }
    };
    fetchStages();
  }, []);

  const handleStageChange = async (newStageId: number) => {
    if (!data?.project?.id) return;
    setUpdatingStage(true);
    try {
        const res = await fetch('/api/updateProjectStage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: data.project.id,
                stageId: newStageId
            })
        });
        const json = await res.json();
        if (json.success) {
            // Optimistic update or refresh
             const selectedStage = stages.find(s => s.id === Number(newStageId));
             if (selectedStage && data.project.stage_id) {
                 // Update local state for immediate feedback
                 setData(prev => prev ? ({
                     ...prev,
                     project: {
                         ...prev.project!,
                         stage_id: [selectedStage.id, selectedStage.name]
                     }
                 }) : null);
             }
        } else {
            alert("Failed to update stage");
        }
    } catch (e) {
        console.error(e);
        alert("Error updating stage");
    } finally {
        setUpdatingStage(false);
    }
  };

  const fetchDetails = React.useCallback(async () => {
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
  }, [projectName]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleProjectUpdated = () => {
      fetchDetails();
  };

  const handleTaskAdded = () => {
      fetchDetails(); // Reload to see new task
  };


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
        
        // Refresh monitor
        fetchDetails();
        
    } catch (e) {
        console.error(e);
        alert("Failed to mark as done");
    } finally {
        setProcessing(false);
        setIsModalOpen(false);
        setSelectedTask(null);
    }
  };

  const soId = data.project?.sale_order_id ? data.project.sale_order_id[0] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-8">
      
      {/* Back Button */}
      <div className="mb-4">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </button>
      </div>

      {/* New Project Header */}
      {data.project && (
        <ProjectHeader 
          project={data.project} 
          picNames={data.pic_names} 
          stages={stages} 
          onStageChange={handleStageChange}
          updatingStage={updatingStage}
          onEdit={() => setIsEditModalOpen(true)}
          calculatedProgress={
              data.tasks.length > 0 
                ? data.tasks.reduce((acc, t) => acc + (t.x_studio_progress || 0), 0) / 100
                : 0
          }
          category={category}
        />
      )}

      {/* Documents Section */}
      {data.project?.id && (
        <DocumentList projectId={data.project.id} />
      )}

      {/* Timeline Section Header with Add Task Button */}
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workflow Stages</h2>
          
          {soId ? (
              <button 
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                  <Plus className="w-4 h-4" />
                  Add Task
              </button>
          ) : (
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                 Linked SO Required to Add Task
              </span>
          )}
      </div>
      
      {category.toLowerCase() === 'design' ? (
        <ProjectTimeline 
          tasks={data.tasks} 
          onMarkDone={handleOpenModal} 
        />
      ) : (
        <ProjectTaskTable 
          tasks={data.tasks} 
          onUpdateTask={handleTaskAdded}
        />
      )}

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

      {/* Edit Project Modal */}
      {data.project && (
          <EditProjectModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onUpdate={handleProjectUpdated}
            project={data.project}
            currentPicIds={data.pic_ids}
          />
      )}
      
      {/* Add Task Modal */}
      {data.project?.sale_order_id && (
          <AddTaskModal 
             isOpen={isAddTaskModalOpen}
             onClose={() => setIsAddTaskModalOpen(false)}
             onAdded={handleTaskAdded}
             soId={data.project.sale_order_id[0]}
          />
      )}

    </div>
  );
}
