
// components/ProjectHeader.tsx
import React from "react";
import type { ProjectDetail } from "../types";

interface ProjectHeaderProps {
  projectName: string;
  project?: ProjectDetail | null;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectName,
  project,
}) => {
  return (
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
        {projectName}
      </h1>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {project?.stage_id && (
          <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1">
            {project.stage_id[1]}
          </span>
        )}
        
        {project?.user_id && (
          <span className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium px-3 py-1">
            👤 {project.user_id[1]}
          </span>
        )}
        
        {project?.partner_id && (
          <span className="inline-block rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium px-3 py-1">
            🏢 {project.partner_id[1]}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;