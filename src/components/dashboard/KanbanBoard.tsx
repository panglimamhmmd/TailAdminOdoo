"use client";

import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Clock, User } from "lucide-react";
import Link from "next/link";

// =======================
// Types
// =======================

export type KanbanProject = {
  name: string;
  hasDesign: boolean;
  statusDesign: string;
  progressDesign: number;
  deadlineDesign: string | false;
  picDesign: string[]; // Names
  // Helper to map back to original object if needed, but for now we just need these fields
  originalIndex?: number; 
  stageId?: number; // Changed to match TransformedProject
  id?: number; 
};

export type KanbanStage = {
    id: number;
    name: string;
};

interface KanbanBoardProps {
  projects: KanbanProject[]; // Using KanbanProject[] to accept the TransformedProject from page
  stages: KanbanStage[];
  onUpdateStage: (projectId: number, newStageId: number) => Promise<void>;
}

// =======================
// Draggable Card
// =======================

const ItemType = "PROJECT_CARD";

interface DragItem {
  id: number;
  currentStageId: number;
}

const KanbanCard = ({ project }: { project: KanbanProject }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id: project.id, currentStageId: project.stageId || 0 }, 
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const daysLeft = (() => {
      if (!project.deadlineDesign) return null;
      const diff = new Date(project.deadlineDesign).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  return (
    <div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      className={`group relative bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-3 cursor-grab hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded">
           #{project.id || "?"}
        </span>
        {daysLeft !== null && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                daysLeft < 0 ? "text-red-600 bg-red-50" : daysLeft <= 7 ? "text-orange-600 bg-orange-50" : "text-gray-500 bg-gray-100"
            }`}>
                <Clock className="w-3 h-3" />
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
            </span>
        )}
      </div>

      <h4 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 text-sm pr-6">
         <Link href={`/project-management/design/${encodeURIComponent(project.name)}`} className="hover:text-blue-600 hover:underline">
            {project.name}
         </Link>
      </h4>

      {/* Hover Action */}
      <Link 
        href={`/project-management/design/${encodeURIComponent(project.name)}`}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
        title="View Details"
      >
        <ChevronRight size={14} />
      </Link>

      <div className="flex items-center justify-between mt-auto">
         {/* PICs */}
         <div className="flex -space-x-2">
            {project.picDesign && project.picDesign.length > 0 ? (
                project.picDesign.slice(0, 3).map((pic: string, i: number) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-600" title={pic}>
                        {pic.charAt(0)}
                    </div>
                ))
            ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-400" />
                </div>
            )}
         </div>

         {/* Progress */}
         <div className="text-xs font-bold text-gray-500">
            {project.progressDesign}%
         </div>
      </div>
       <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progressDesign}%` }} />
       </div>
    </div>
  );
};

// =======================
// Droppable Column
// =======================
import { ChevronRight } from "lucide-react"; // Import added

const KanbanColumn = ({ stage, projects, onDrop }: { stage: KanbanStage, projects: KanbanProject[], onDrop: (projectId: number, stageId: number) => void }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: DragItem) => onDrop(item.id, stage.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const stageProjects = projects.filter(p => {
      if (p.stageId) return p.stageId === stage.id;
      return (p.statusDesign || "New") === stage.name;
  });

  // Color Mapping
  const getHeaderColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("done") || lower.includes("completed")) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (lower.includes("progress") || lower.includes("development")) return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    if (lower.includes("todo") || lower.includes("new") || lower.includes("draft")) return "text-gray-600 bg-gray-100 dark:bg-gray-800";
    if (lower.includes("cancel")) return "text-red-600 bg-red-50 dark:bg-red-900/20";
    return "text-gray-600 bg-gray-100 dark:bg-gray-800";
  };

  const headerStyle = getHeaderColor(stage.name);

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={`flex-1 min-w-[280px] bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-transparent transition-colors ${
        isOver ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className={`font-bold text-sm uppercase tracking-wide px-3 py-1 rounded-lg ${headerStyle}`}>
          {stage.name}
        </h3>
        <span className="text-gray-400 text-xs font-bold">
           {stageProjects.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {stageProjects.length > 0 ? (
            stageProjects.map((p, i) => (
            <KanbanCard key={p.id || i} project={p} />
            ))
        ) : (
            <div className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium">
                Empty
            </div>
        )}
      </div>
    </div>
  );
};

// =======================
// Board
// =======================

export default function KanbanBoard({ projects, stages, onUpdateStage }: KanbanBoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex overflow-x-auto pb-8 gap-6 snap-x px-1">
        {stages.map(stage => (
          <KanbanColumn 
             key={stage.id} 
             stage={stage} 
             projects={projects} 
             onDrop={(projectId, newStageId) => onUpdateStage(projectId, newStageId)} 
          />
        ))}
      </div>
    </DndProvider>
  );
}
