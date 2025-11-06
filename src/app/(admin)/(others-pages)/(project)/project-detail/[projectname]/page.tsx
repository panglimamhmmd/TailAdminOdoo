"use client";

import React, { use, useState } from "react";
import type { TabType, DetailedProject } from "./types";
import useProjectData from "./hook/useProjectData";
import ProjectHeader from "./components/ProjectComponents";
import ProjectInfoCards from "./components/ProjectInfo";
import ProjectProgress from "./components/ProjectProgress";
import ProjectTabs from "./components/ProjectTabs";
import FinanceOverview from "./components/FinanceOverview";
// import TasksSection from "./components/TaskComponents";

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectname: string }>;
}) {
  const resolvedParams = use(params);
  const projectName = resolvedParams.projectname;
  const [activeTab, setActiveTab] = useState<TabType>("design");

  const {
    projects,
    groupedProjects,
    extractedProjectName,
    loading,
    error,
    refetch,
  } = useProjectData(projectName);

  const progressDesign = projects[0]?.project?.x_progress_project ?? 0;
  const progressConstruction = projects[1]?.project?.x_progress_project ?? 0;
  const progressInterior = projects[2]?.project.x_progress_project ?? 0;
  console.log(progressConstruction, "progressConstruction Anjasmaradita");
  console.log(progressInterior, "progressInterior");
  console.log(progressDesign, "progressDesign");

  const renderProjectContent = (project: DetailedProject | undefined) => {
    if (!project) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No data available for this category
        </div>
      );
    }

    console.log("Rendering content for project:", project);

    return (
      <div>
        <FinanceOverview project={project} />
        {/* <TasksSection tasks={project.tasks} tasksCount={project.tasks_count} /> */}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Loading project data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Error
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Project Not Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No project found with name:{" "}
              <strong>{decodeURIComponent(projectName || "")}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
          {/* Header Section */}
          <div className="mb-3 pb-8 border-b border-gray-200 dark:border-gray-700">
            <ProjectHeader
              projectName={extractedProjectName || projectName}
              project={projects[0]?.project}
            />

            <ProjectInfoCards />
          </div>
          <ProjectProgress />

          {/* Tabs */}
          <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div>
            {activeTab === "design" && renderProjectContent(groupedProjects.design)}
            {activeTab === "construction" && renderProjectContent(groupedProjects.construction)}
            {activeTab === "interior" && renderProjectContent(groupedProjects.interior)}
          </div>
        </div>
      </div>
    </div>
  );
}