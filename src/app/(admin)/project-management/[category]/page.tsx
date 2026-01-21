"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Filter, Search } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { BoxIconLine, GroupIcon, CheckCircleIcon, CloseIcon } from "@/icons";

// Types matching the API response
interface TransformedProject {
  name: string;
  progressDesign: number;
  progressConstruction: number;
  progressInterior: number;
  deadlineDesign: string | false;
  deadlineConstruction: string | false;
  deadlineInterior: string | false;
  startDateDesign?: string | false;
  startDateConstruction?: string | false;
  startDateInterior?: string | false;
  hasDesign: boolean;
  hasConstruction: boolean;
  hasInterior: boolean;
  statusDesign: string; // e.g. "In Progress", "New", "Done"
  statusConstruction: string;
  statusInterior: string;
}

const STAGE_FILTERS = ["All", "To Do", "In Progress", "Done", "Cancelled"];

export default function ProjectCategoryPage() {
  const params = useParams();
  const category = params.category as string; // 'design' | 'interior' | 'construction'
  
  const [projects, setProjects] = useState<TransformedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("In Progress");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projectList");
        if (!res.ok) throw new Error("Failed to fetch projects");
        
        const data = await res.json();
        if (data.success && data.projects) {
          // Initial category filtering
          const allProjects = data.projects as TransformedProject[];
          const relevant = allProjects.filter(p => {
            if (category === 'design') return p.hasDesign;
            if (category === 'interior') return p.hasInterior;
            if (category === 'construction') return p.hasConstruction;
            return false;
          });
          setProjects(relevant);
        } else {
          setError("Invalid data format");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [category]);

  const getStatus = (p: TransformedProject) => {
    if (category === 'design') return p.statusDesign;
    if (category === 'interior') return p.statusInterior;
    if (category === 'construction') return p.statusConstruction;
    return 'Unknown';
  };

  const getProgress = (p: TransformedProject) => {
    if (category === 'design') return p.progressDesign;
    if (category === 'interior') return p.progressInterior;
    if (category === 'construction') return p.progressConstruction;
    return 0;
  };

  const getDeadline = (p: TransformedProject) => {
    if (category === 'design') return p.deadlineDesign;
    if (category === 'interior') return p.deadlineInterior;
    if (category === 'construction') return p.deadlineConstruction;
    return '-';
  };

  // New Helper Functions (Correctly placed here)
  const getDaysLeft = (p: TransformedProject) => {
    const deadlineStr = getDeadline(p);
    if (!deadlineStr || deadlineStr === '-') return null;
    
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDaysLeftLabel = (days: number | null) => {
    if (days === null) return <span className="text-gray-400 text-sm">No Deadline</span>;
    if (days < 0) return <span className="text-red-500 text-sm font-medium">Overdue by {Math.abs(days)} days</span>;
    if (days === 0) return <span className="text-orange-500 text-sm font-medium">Due Today</span>;
    return <span className={`text-sm font-medium ${days <= 7 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>{days} days left</span>;
  };

  // Stats Calculation
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => {
       const s = getStatus(p).toLowerCase();
       return !s.includes('done') && !s.includes('cancel') && !s.includes('complete');
    }).length,
    done: projects.filter(p => {
       const s = getStatus(p).toLowerCase();
       return s.includes('done') || s.includes('complete');
    }).length,
    cancelled: projects.filter(p => {
       const s = getStatus(p).toLowerCase();
       return s.includes('cancel');
    }).length,
  };

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    // 1. Search Query
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Status Filter
    if (activeFilter !== "All") {
      const status = getStatus(p);
      // Basic fuzzy match for standard Odoo stages
      if (activeFilter === "To Do" && !["New", "To Do", "Draft"].some(s => status.includes(s))) return false;
      if (activeFilter === "In Progress" && !["In Progress", "Ongoing"].some(s => status.includes(s))) return false;
      if (activeFilter === "Done" && !["Done", "Completed", "Finished"].some(s => status.includes(s))) return false;
      if (activeFilter === "Cancelled" && !["Cancelled"].some(s => status.includes(s))) return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("done") || s.includes("completed")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (s.includes("progress") || s.includes("ongoing")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (s.includes("cancel")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading {categoryTitle} Projects...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 2xl:px-10">
      
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

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {categoryTitle} Projects
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search projects..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
             />
           </div>
           <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
             {STAGE_FILTERS.map(filter => (
               <button
                 key={filter}
                 onClick={() => setActiveFilter(filter)}
                 className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                   activeFilter === filter 
                     ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400" 
                     : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                 }`}
               >
                 {filter}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
           <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
             <p className="text-lg font-medium">No projects found</p>
             <p className="text-sm">Try adjusting your filters or search query</p>
           </div>
        ) : (
          filteredProjects.map((project, idx) => {
             const status = getStatus(project);
             return (
              <div key={idx} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{getDaysLeftLabel(getDaysLeft(project))}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{getProgress(project)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${getProgress(project)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-end">
                   <Link 
                     href={`/project-management/${category}/${encodeURIComponent(project.name)}`}
                     className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
                   >
                     View Tasks
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                   </Link>
                </div>
              </div>
             );
          })
        )}
      </div>
    </div>
  );
}
