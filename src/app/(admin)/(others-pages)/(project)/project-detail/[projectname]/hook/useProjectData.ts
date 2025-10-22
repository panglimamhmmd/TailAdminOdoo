// hooks/useProjectData.ts
import { useState, useEffect } from "react";
import type { DetailedProject, GroupedProjects } from "../types";
import { PROJECT_TAGS } from "../utils/constant";

export const useProjectData = (projectName: string) => {
  const [projects, setProjects] = useState<DetailedProject[]>([]);
  const [groupedProjects, setGroupedProjects] = useState<GroupedProjects>({});
  const [extractedProjectName, setExtractedProjectName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupProjectsByTag = (projectsList: DetailedProject[]) => {
    const grouped: GroupedProjects = {};
    
    projectsList.forEach((project) => {
      const tagIds = project.project?.tag_ids || [];

      // Extract clean project name once
      if (project.project?.name && !extractedProjectName) {
        const parts = project.project.name.split(" - ");
        setExtractedProjectName(
          parts.length > 1 ? parts.slice(1).join(" - ") : project.project.name
        );
      }

      // Group by tag
      if (tagIds.includes(PROJECT_TAGS.CONSTRUCTION)) {
        grouped.construction = project;
      } else if (tagIds.includes(PROJECT_TAGS.INTERIOR)) {
        grouped.interior = project;
      } else if (tagIds.includes(PROJECT_TAGS.DESIGN)) {
        grouped.design = project;
      }
    });
    
    setGroupedProjects(grouped);
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/projectdetail/${projectName}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      setProjects(data.projects || []);
      groupProjectsByTag(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProjects([]);
      setGroupedProjects({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectName) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName]);

  return {
    projects,
    groupedProjects,
    extractedProjectName,
    loading,
    error,
    refetch: fetchProjects,
  };
};  

export default useProjectData;