interface ProjectCardProps {
  projectName: string;
  progressDesign: number;
  progressConstruction: number;
  progressInterior: number;
  deadline: string;
}

export const ProjectCard = ({
  projectName,
  progressDesign,
  progressConstruction,
  progressInterior,
  deadline,
}: ProjectCardProps) => {
  // Format deadline
  const formattedDeadline = new Date(deadline).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Progress bar component
  const ProgressBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-800 dark:text-white">
          {value}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 dark:bg-blue-500"
          style={{ width: `${value}%` }}
        />
          <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 dark:bg-blue-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
   <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
  {/* Project Name - Fixed Height Area */}
  <div className="mb-6 min-h-[3.5rem] flex items-start">
    <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2">
      {projectName} 
    </h3>
  </div>

  {/* Progress Bars - Flex Grow to Push Deadline Down */}
  <div className="space-y-4 mb-6 flex-grow">
    <ProgressBar label="Design" value={progressDesign} />
    <ProgressBar label="Construction" value={progressConstruction} />
    <ProgressBar label="Interior" value={progressInterior} />
  </div>

  {/* Deadline - Always at Bottom */}
  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Deadline
      </span>
      <span className="text-sm font-semibold text-gray-800 dark:text-white">
        {formattedDeadline}
      </span>
    </div>
  </div>
</div>
  );
};