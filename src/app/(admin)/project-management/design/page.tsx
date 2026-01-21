"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  Clock, 
  User, 
  ChevronRight,
  Filter,
  Search,
  LayoutGrid, // For Kanban
  List as ListIcon // For List
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { BoxIconLine, GroupIcon, CheckCircleIcon, CloseIcon } from "@/icons";
import KanbanBoard from "@/components/dashboard/KanbanBoard";

// Matches API Response
interface TransformedProject {
  name: string;
  id?: number; // Added
  stageId?: number; // Added
  hasDesign: boolean;
  statusDesign: string;
  progressDesign: number;
  deadlineDesign: string | false;
  picDesign: string[]; // Names
  nextTaskDesign: {
    name: string;
    deadline: string | false;
    percentage: number;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Done": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Cancelled": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "To Do": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "New": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function DesignProjectPage() {
  const [projects, setProjects] = useState<TransformedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View State
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [stages, setStages] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
     if (error) console.error("Error state:", error); 
  }, [error]);
  
  // Fetch Stages
  useEffect(() => {
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
  
  // Filters
  const [activeFilter, setActiveFilter] = useState("In Progress");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projectList");
        if (!res.ok) {
             const errData = await res.json().catch(() => ({}));
             throw new Error(errData.error || `Failed to fetch projects: ${res.status}`);
        }
         const data = await res.json();
        
        if (data.success && data.projects) {
          // Filter only Design Projects
          setProjects(data.projects.filter((p: TransformedProject) => p.hasDesign));
        }
      } catch (err: unknown) {
        console.error("Fetch Logic Error:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load design projects: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getDaysLeft = (dateStr: string | false) => {
    if (!dateStr) return null;
    const deadline = new Date(dateStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredProjects = projects.filter(p => {
    // Search
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Status Filter (Smart Matching)
    const status = p.statusDesign || "Unknown";
    if (activeFilter === "All") return true;
    if (activeFilter === "In Progress" && ["In Progress", "Ongoing"].some(s => status.includes(s))) return true;
    if (activeFilter === "Done" && ["Done", "Completed"].some(s => status.includes(s))) return true;
    if (activeFilter === "To Do" && ["New", "To Do", "Draft"].some(s => status.includes(s))) return true;
    
    return false;
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => {
       const s = (p.statusDesign || "").toLowerCase();
       return !s.includes('done') && !s.includes('cancel') && !s.includes('complete');
    }).length,
    done: projects.filter(p => {
       const s = (p.statusDesign || "").toLowerCase();
       return s.includes('done') || s.includes('complete');
    }).length,
    cancelled: projects.filter(p => {
       const s = (p.statusDesign || "").toLowerCase();
       return s.includes('cancel');
    }).length,
  };

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <StatCard 
            title="Total Projects" 
            value={stats.total} 
            icon={<BoxIconLine className="text-gray-800 dark:text-white" />} 
            onClick={() => setActiveFilter("All")}
            isActive={activeFilter === "All"}
            color="default"
         />
         <StatCard 
            title="In Progress" 
            value={stats.inProgress} 
            icon={<GroupIcon className="text-blue-600 dark:text-blue-400" />} 
            onClick={() => setActiveFilter("In Progress")}
            isActive={activeFilter === "In Progress"}
            color="blue"
         />
         <StatCard 
            title="Done" 
            value={stats.done} 
            icon={<CheckCircleIcon className="text-green-600 dark:text-green-400" />} 
            onClick={() => setActiveFilter("Done")}
            isActive={activeFilter === "Done"}
            color="green"
         />
         <StatCard 
            title="Cancelled" 
            value={stats.cancelled} 
            icon={<CloseIcon className="text-red-600 dark:text-red-400" />} 
            onClick={() => setActiveFilter("Cancelled")}
            isActive={activeFilter === "Cancelled"}
            color="red"
         />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Design Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage architectural and interior design phases</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
             <button
               onClick={() => setViewMode("list")}
               className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"}`}
               title="List View"
             >
               <ListIcon className="w-4 h-4" />
             </button>
             <button
               onClick={() => setViewMode("board")}
               className={`p-2 rounded-md transition-all ${viewMode === "board" ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"}`}
               title="Kanban Board"
             >
               <LayoutGrid className="w-4 h-4" />
             </button>
          </div>

          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
             />
          </div>
          {viewMode === "list" && (
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {["To Do", "In Progress", "Done"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeFilter === f 
                    ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === "board" ? (
        <KanbanBoard 
          projects={filteredProjects} 
          stages={stages} 
          onUpdateStage={async (projectId, newStageId) => {
             // Find original project to get current stage for rollback if needed
             // Optimistic Update
             setProjects(prev => prev.map(p => {
                 if (p.id === projectId) {
                    // Update status string based on new stage ID to matching stage name
                    const targetStage = stages.find(s => s.id === newStageId);
                    return {
                        ...p,
                        stageId: newStageId,
                        statusDesign: targetStage ? targetStage.name : p.statusDesign
                    };
                 }
                 return p;
             }));

             try {
                 const res = await fetch('/api/updateProjectStage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectId, stageId: newStageId })
                 });
                 if (!res.ok) throw new Error("Update failed");
             } catch (e) {
                 console.error(e);
                 alert("Failed to update status");
                 // Revert logic could leverage reloading all projects
                 // window.location.reload(); 
             }
          }}
        />
      ) : (
      /* List Content */
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No projects found in &quot;{activeFilter}&quot;</p>
          </div>
        ) : (
          filteredProjects.map((p, idx) => {
            const daysLeft = getDaysLeft(p.deadlineDesign);
            return (
              <div key={idx} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                
                {/* 1. Status & Title */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[p.statusDesign] || "bg-gray-100 text-gray-600"}`}>
                      {p.statusDesign}
                    </span>
                    {daysLeft !== null && daysLeft < 0 && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${p.progressDesign}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{p.progressDesign}%</span>
                  </div>
                </div>

                {/* 2. Next Task Section (Highlighted) */}
                <div className="flex-1 md:border-l md:border-r border-gray-100 dark:border-gray-700 md:px-6 w-full md:w-auto">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Next Action
                    </div>
                    {p.nextTaskDesign ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 line-clamp-1">
                            {p.nextTaskDesign.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                          <Clock className="w-3 h-3" />
                          <span>
                            {p.nextTaskDesign.deadline || "No Deadline"}
                          </span>
                        </div>
                      </div>
                    ) : (
                       <div className="flex items-center gap-2 text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg">
                         <CheckCircle className="w-4 h-4" />
                         All tasks up to date
                       </div>
                    )}
                </div>

                {/* 3. PIC & Meta */}
                <div className="min-w-[180px] flex flex-col gap-3">
                   {/* PICs */}
                   <div>
                     <p className="text-xs font-semibold text-gray-400 mb-1.5 uppercase">PIC</p>
                     <div className="flex flex-col gap-1">
                        {p.picDesign.length > 0 ? (
                          p.picDesign.map((pic, i) => (
                            <div key={i} className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400" />
                              {pic}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                     </div>
                   </div>

                   {/* Project Deadline */}
                   <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1 uppercase">Deadline</p>
                      <p className={`text-sm font-medium ${daysLeft !== null && daysLeft <= 7 ? "text-orange-500" : "text-gray-700 dark:text-gray-300"}`}>
                        {p.deadlineDesign || "-"}
                      </p>
                   </div>
                </div>

                {/* 4. Action */}
                <div className="flex items-center self-center md:self-auto">
                   <Link 
                     href={`/project-management/design/${encodeURIComponent(p.name)}`}
                     className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                   >
                     <ChevronRight className="w-6 h-6" />
                   </Link>
                </div>

              </div>
            );
          })
        )}
      </div>
      )}
    </div>
  );
}
