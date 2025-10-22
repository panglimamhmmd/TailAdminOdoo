'use client';
import React, { useState, useEffect } from 'react';
import ProjectCard from '@/components/project/ProjectCard';
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { ChevronLeftIcon } from '@/icons';
import Link from 'next/dist/client/link';

export interface ProjectProgress {
  name: string;
  progressDesign: number;
  progressConstruction: number;
  progressInterior: number;
  deadlineDesign: string;          // format: YYYY-MM-DD
  deadlineConstruction: string;    // format: YYYY-MM-DD
  deadlineInterior: string;        // format: YYYY-MM-DD
  startDateDesign: string;         // format: YYYY-MM-DD
  startDateConstruction: string;   // format: YYYY-MM-DD
  startDateInterior: string;       // format: YYYY-MM-DD
}

export default function ProjectList() {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [projects, setProjects] = useState<ProjectProgress[]>([]);

  const fetchProjects = async () => {
    // Simulasi fetch data dari API
    const response = await fetch('/api/projectList');
    const data = await response.json();
    setProjects(data.projects);
  }

  const totalCards = projects.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => {
        const nextIndex = (prev +  1  ) % totalCards;
        return nextIndex;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [totalCards]);

  useEffect(() => {
    
    const newFlippedCards = new Set<number>();
    
    // Add current pair (dengan handling circular)
    newFlippedCards.add(currentPairIndex);
    newFlippedCards.add((currentPairIndex ) % totalCards);
    setFlippedCards(newFlippedCards);
  }, [currentPairIndex, totalCards]);

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(() => {
            fetchProjects(); // Panggil fetchProjects lagi, bukan reload page
        }, 60000); // 60 detik

        return () => clearInterval(interval);
    }, []); // Kosongkan dependency array untuk hanya menjalankan sekali saat mount

  return (
    <div className="p-2 min-h-screen">
      <div className="mb-3">
        <div className='flex items-center justify-between'>
          <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Projects On Progress</h1>
        <ThemeToggleButton />
        </div>
      </div>
    
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            projectName={project.name}
            progressDesign={project.progressDesign}
            progressConstruction={project.progressConstruction}
            progressInterior={project.progressInterior}
            deadlineDesign={project.deadlineDesign}
            deadlineConstruction={project.deadlineConstruction}
            deadlineInterior={project.deadlineInterior}
            startDateDesign={project.startDateDesign}
            startDateConstruction={project.startDateConstruction}
            startDateInterior={project.startDateInterior}
            cardIndex={index}
            flippedCards={flippedCards}
          />
        ))}
      </div>
    </div>
  );
}