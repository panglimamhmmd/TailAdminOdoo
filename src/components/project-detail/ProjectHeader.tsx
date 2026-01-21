import React from "react";
import { Building2, Clock, ChevronRight, Check, Pencil } from "lucide-react";

interface ProjectHeaderProps {
  project: {
    name: string;
    partner_id?: [number, string];
    stage_id?: [number, string];
    x_progress_project?: number;
    date?: string;
  };
  picNames: string[];
  stages: { id: number; name: string }[];
  onStageChange: (id: number) => void;
  updatingStage: boolean;
  onEdit: () => void;
  calculatedProgress?: number;
  category?: string; // Added prop
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  picNames,
  stages,
  onStageChange,
  updatingStage,
  onEdit,
  calculatedProgress = 0,
  category = "Project",
}) => {
  const currentStageId = project.stage_id?.[0] || 0;
  const currentStageIndex = stages.findIndex((s) => s.id === currentStageId);
  
  // Use x_progress_project if available, otherwise fallback
  let displayProgress = project.x_progress_project || calculatedProgress || 0;
  
  // Normalize if > 1 (assuming 0-100 scale)
  if (displayProgress > 1) {
      displayProgress = displayProgress / 100;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 dark:opacity-20" />

      <div className="relative p-8">
        {/* Top Row: Breadcrumbs & Meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Projects</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium capitalize">{category}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
                {picNames.map((name, i) => (
                <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700"
                    title={name}
                >
                    {name.charAt(0)}
                </div>
                ))}
            </div>
            <button 
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit Project"
            >
                <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {project.name}
            </h1>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {project.partner_id?.[1] || "Unknown Client"}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Due {project.date || "TBD"}
                </div>
            </div>
          </div>

          {/* Big Progress Stat */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm min-w-[200px]">
             <div className="flex justify-between items-end mb-1">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Overall Progress</span>
                <span className="text-2xl font-bold text-blue-600">{Math.round(displayProgress * 100)}%</span>
             </div>
             <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                  style={{ width: `${displayProgress * 100}%` }} 
                />
             </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
           <div className="flex items-center justify-between relative">
              {/* Line behind */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />
              
              {stages.map((stage, index) => {
                 const isCompleted = index < currentStageIndex;
                 const isCurrent = index === currentStageIndex;
                 
                 return (
                   <div 
                      key={stage.id} 
                      className={`flex flex-col items-center gap-2 cursor-pointer group`}
                      onClick={() => !updatingStage && onStageChange(stage.id)}
                   >
                      <div className={`
                         w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                         ${isCompleted 
                            ? "bg-green-500 border-green-500 text-white" 
                            : isCurrent 
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110" 
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 group-hover:border-gray-400"
                         }
                      `}>
                         {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                          isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                      }`}>
                        {stage.name}
                      </span>
                   </div>
                 );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};
