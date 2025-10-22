// components/ProjectProgress.tsx
import React from "react";
import { MOCK_STAGES } from "../utils/constant";
import PICList from "@/components/PIC/PICList";

interface ProgressBarProps {
  label: string;
  percent: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, percent }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <span className="text-gray-500 dark:text-gray-400 text-sm">{percent}%</span>
    </div>
    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gray-800 dark:bg-gray-300 transition-all duration-700 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

export const ProjectProgress: React.FC = () => {
  const overallProgress = 81; // This should come from actual data

  return (

<div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-4 mt-5">
 <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md mb-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-6">
        Progress & Performance
      </h3>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-700 dark:text-gray-200 font-medium">
            Overall Progress
          </p>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            {overallProgress}%
          </span>
        </div>
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-700 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <div>
        <p className="text-gray-700 dark:text-gray-200 font-medium mb-4">Stages</p>
        <div className="space-y-4">
          {MOCK_STAGES.map((stage, index) => (
            <ProgressBar
              key={index}
              label={stage.label}
              percent={stage.percent}
            />
          ))}
        </div>
      </div>
    </div>
        <PICList projectName="Osso" />
    </div>
    
   
  );
};

export default ProjectProgress;