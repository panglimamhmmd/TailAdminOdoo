// components/ProjectInfoCards.tsx
import React from "react";
import { MOCK_TIMELINE, MOCK_PROJECT_INFO } from "../utils/constant";

interface InfoItemProps {
  label: string;
  value: string;
  color?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, color = "" }) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1 ${color}`}>
      {value}
    </p>
  </div>
);

export const ProjectInfoCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
      {/* Timeline Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-6">
          Timeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          <InfoItem label="Start Date" value={MOCK_TIMELINE.startDate} />
          <InfoItem label="End Date" value={MOCK_TIMELINE.endDate} />
          <InfoItem label="Time Elapsed" value={MOCK_TIMELINE.elapsed} />
          <InfoItem
            label="Days Remaining"
            value={MOCK_TIMELINE.remaining}
            color="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Project Info Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-6">
          Project Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          <InfoItem label="Project Manager" value={MOCK_PROJECT_INFO.manager} />
          <InfoItem label="Client" value={MOCK_PROJECT_INFO.client} />
          <InfoItem
            label="Budget"
            value={MOCK_PROJECT_INFO.budget}
            color="text-emerald-600 dark:text-emerald-400"
          />  
          <InfoItem label="Location" value={MOCK_PROJECT_INFO.location} />
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoCards;