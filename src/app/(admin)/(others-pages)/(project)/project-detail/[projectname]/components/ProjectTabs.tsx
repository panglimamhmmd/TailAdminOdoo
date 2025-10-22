// components/ProjectTabs.tsx
import React from "react";
import type { TabType } from "../types";

interface ProjectTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TAB_CONFIG: { id: TabType; label: string; icon: string }[] = [
  { id: "design", label: "Design", icon: "🎨" },
  { id: "construction", label: "Construction", icon: "🔨" },
  { id: "interior", label: "Interior", icon: "🏠" },
];

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-3 text-center">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectTabs;