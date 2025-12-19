import React, { useState } from 'react';
import PICList from '@/components/PIC/PICList';

interface ProjectCardProps {
  projectName: string;
  progressDesign: number;
  progressConstruction: number;
  progressInterior: number;
  deadlineDesign: string;
  deadlineConstruction: string;
  deadlineInterior: string;
  startDateDesign?: string;
  startDateConstruction?: string;
  startDateInterior?: string;
  cardIndex: number;
  flippedCards: Set<number>;
}

const ProjectCard = ({
  projectName,
  progressDesign,
  progressConstruction,
  progressInterior,
  deadlineDesign,
  deadlineConstruction,
  deadlineInterior,
  startDateDesign,
  startDateConstruction,
  startDateInterior,
  cardIndex,
  flippedCards,
}: ProjectCardProps) => {
  const [isManualFlip, setIsManualFlip] = useState(false);
  const isFlipped = flippedCards.has(cardIndex) || isManualFlip;

  const calculateTimeProgress = (startDate?: string, deadline?: string): number => {
    if (!startDate || !deadline) return 0;
    
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(deadline).getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    
    if (totalDuration <= 0) return 0;
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    return Math.round(progress);
  };

  const timeProgressDesign = calculateTimeProgress(startDateDesign, deadlineDesign);
  const timeProgressConstruction = calculateTimeProgress(startDateConstruction, deadlineConstruction);
  const timeProgressInterior = calculateTimeProgress(startDateInterior, deadlineInterior);

  const DoubleProgressBar = ({ 
    label, 
    actualProgress, 
    timeProgress 
  }: { 
    label: string; 
    actualProgress: number;
    timeProgress: number;
  }) => {
    const isAhead = actualProgress >= timeProgress;
    const progressColor = isAhead ? 'bg-green-500' : 'bg-red-500';
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">
            {actualProgress}%
          </span>
        </div>
        <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-300"
            style={{ width: `${timeProgress}%` }}
          />
          <div
            className={`absolute top-0 left-0 h-full ${progressColor} rounded-full transition-all duration-300`}
            style={{ width: `${actualProgress}%` }}
          />
        </div>
      </div>
    );
  };

  const handleClick = () => {
    setIsManualFlip(!isManualFlip);
  };

  return (
    <div 
       className="relative h-[240px] cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front Side */}
        <div 
          className="absolute w-full h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-3 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-300"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="mb-1 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] flex justify-center items-center">
            <h3
             className="text-sm font-bold text-gray-800 dark:text-white text-center line-clamp-2 leading-tight uppercase truncate"
              title={projectName}
            >
              {projectName}
            </h3>
          </div>

          <div className=" space-y-2">
            <DoubleProgressBar 
              label="Design" 
              actualProgress={progressDesign}
              timeProgress={timeProgressDesign}
            />
            <DoubleProgressBar 
              label="Construction" 
              actualProgress={progressConstruction}
              timeProgress={timeProgressConstruction}
            />
            <DoubleProgressBar 
              label="Interior" 
              actualProgress={progressInterior}
              timeProgress={timeProgressInterior}
            />
          </div>
        </div>

        {/* Back Side */}
        <div 
className="absolute w-full h-full rounded-xl border-2 border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-800 dark:via-indigo-950 dark:to-purple-950 p-3 shadow-xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white text-center uppercase truncate">
    {projectName}
            </h3>
          </div>

          <div className="space-y-2">
            <PICList projectName={projectName.toUpperCase()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;