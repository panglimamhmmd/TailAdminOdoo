"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Mail, 
  Briefcase, 
  ChevronRight, 
  Loader2,
  FolderOpen,
  UserPlus
} from "lucide-react";
import useSWR from 'swr';

// Interfaces
interface Employee {
  id: number;
  name: string;
  job_title: string | false;
  work_email: string | false;
  image_128: string | false;
  department_id: [number, string] | false; // Odoo Many2one format: [id, "Name"]
}

interface Project {
  name: string;
  statusDesign: string;
  picDesign: string[]; // Names matching Employee.name
}

interface TeamMember extends Employee {
  activeProjects: Project[];
  finishedProjects: Project[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface DepartmentGroup {
  name: string;
  members: TeamMember[];
}

export default function DesignTeamPage() {
  // 1. Fetch Data
  const { data: empData, isLoading: empLoading } = useSWR('/api/employees', fetcher);
  const { data: projData, isLoading: projLoading } = useSWR('/api/projectList', fetcher);

  const [departments, setDepartments] = useState<DepartmentGroup[]>([]);

  // 2. Combine Data
  useEffect(() => {
    if (empData?.success && projData?.success) {
      const employees: Employee[] = empData.data;
      const projects: Project[] = projData.projects;

      const combined = employees.map(emp => {
        const empProjects = projects.filter(p => 
            p.picDesign && p.picDesign.some(picName => picName === emp.name)
        );

        return {
          ...emp,
          activeProjects: empProjects.filter(p => !['Done', 'Cancelled'].includes(p.statusDesign || '')),
          finishedProjects: empProjects.filter(p => ['Done'].includes(p.statusDesign || ''))
        };
      });

      // Group by Department
      const groups: Record<string, TeamMember[]> = {};
      
      combined.forEach(member => {
        // department_id is [id, "Name"]
        // If undefined/false, group under "Other"
        const deptName = Array.isArray(member.department_id) ? member.department_id[1] : "Other";
        
        if (!groups[deptName]) groups[deptName] = [];
        groups[deptName].push(member);
      });

      // Convert to array and sort specific order if needed
      const deptOrder = ['Design', 'Interior', 'Construction'];
      const sortedGroups = Object.entries(groups).map(([name, members]) => ({
        name,
        members: members.sort((a, b) => b.activeProjects.length - a.activeProjects.length)
      })).sort((a, b) => {
        const idxA = deptOrder.indexOf(a.name);
        const idxB = deptOrder.indexOf(b.name);
        // If both in list, sort by index. If one not in list, push to end.
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setDepartments(sortedGroups);
    }
  }, [empData, projData]);

  if (empLoading || projLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <Users className="w-8 h-8 text-blue-600" />
             Team & Resources
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 ml-11">
            Overview of designers, workload distribution, and availability by department.
          </p>
        </div>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          onClick={() => alert("To add a member, allow 'User Management' integration.")}
        >
           <UserPlus className="w-4 h-4" />
           Add Member
        </button>
      </div>

      {/* Department Sections */}
      <div className="space-y-12">
        {departments.map((dept) => (
          <div key={dept.name}>
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <Briefcase className="w-5 h-5 text-gray-400" />
                {dept.name} Team
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full ml-2">
                   {dept.members.length}
                </span>
             </h2>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {dept.members.map((member) => (
                  <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all group">
                     {/* Profile Header */}
                     <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-sm relative">
                           {/* fallback to icon if image is missing */}
                           {member.image_128 ? (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img 
                                  src={`data:image/png;base64,${member.image_128}`} 
                                  alt={member.name}
                                  className="w-full h-full object-cover" 
                               />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400">
                                   <Users className="w-8 h-8" />
                               </div>
                           )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                             {member.name}
                           </h3>
                           <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 truncate">
                             {member.job_title || "Team Member"}
                           </p>
                           {member.work_email && (
                             <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{member.work_email}</span>
                             </div>
                           )}
                        </div>
                     </div>

                     {/* Stats */}
                     <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                           <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold uppercase mb-1">Active</p>
                           <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-blue-700 dark:text-white">{member.activeProjects.length}</span>
                              <span className="text-xs text-blue-500">projects</span>
                           </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                           <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Completed</p>
                           <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{member.finishedProjects.length}</span>
                              <span className="text-xs text-gray-400">projects</span>
                           </div>
                        </div>
                     </div>

                     {/* Active Projects Preview */}
                     <div>
                        <div className="flex items-center justify-between mb-3">
                           <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                             <FolderOpen className="w-3 h-3 text-gray-400" />
                             Current Workload
                           </h4>
                        </div>
                        
                        <div className="space-y-2">
                           {member.activeProjects.length > 0 ? (
                              member.activeProjects.slice(0, 3).map((p, idx) => (
                                <Link 
                                   key={idx} 
                                   href={`/project-management/design/${encodeURIComponent(p.name)}`}
                                   className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                   <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{p.name}</span>
                                   <ChevronRight className="w-3 h-3 text-gray-400" />
                                </Link>
                              ))
                           ) : (
                              <div className="text-center py-4 text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800/30 rounded border border-dashed border-gray-200 dark:border-gray-700">
                                 No active assignments
                              </div>
                           )}
                           
                           {member.activeProjects.length > 3 && (
                              <div className="text-center pt-1">
                                <span className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">
                                  + {member.activeProjects.length - 3} more projects
                                </span>
                              </div>
                           )}
                        </div>
                     </div>

                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
