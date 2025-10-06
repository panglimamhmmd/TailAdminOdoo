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

  // const projek = [
  //   {
  //     name: "Villa Modern Minimalis",
  //     progressDesign: 20,
  //     progressConstruction: 60,
  //     progressInterior: 30,
  //     deadlineDesign: "2025-12-31",
  //     deadlineConstruction: "2026-06-30",
  //     deadlineInterior: "2026-12-31",
  //     startDateDesign: "2025-01-01",
  //     startDateConstruction: "2025-06-01",
  //     startDateInterior: "2026-01-01",
  //   },
  //   {
  //     name: "Rumah Tropis Bali",
  //     progressDesign: 75,
  //     progressConstruction: 45,
  //     progressInterior: 10,
  //     deadlineDesign: "2025-11-30",
  //     deadlineConstruction: "2026-05-31",
  //     deadlineInterior: "2026-10-31",
  //     startDateDesign: "2025-02-01",
  //     startDateConstruction: "2025-07-01",
  //     startDateInterior: "2026-02-01",
  //   },
  //   {
  //     name: "Apartemen High Rise",
  //     progressDesign: 90,
  //     progressConstruction: 30,
  //     progressInterior: 5,
  //     deadlineDesign: "2025-10-31",
  //     deadlineConstruction: "2026-04-30",
  //     deadlineInterior: "2026-09-30",
  //     startDateDesign: "2025-03-01",
  //     startDateConstruction: "2025-08-01",
  //     startDateInterior: "2026-03-01",
  //   },
  //   {
  //     name: "Office Building",
  //     progressDesign: 50,
  //     progressConstruction: 20,
  //     progressInterior: 0,
  //     deadlineDesign: "2025-09-30",
  //     deadlineConstruction: "2026-03-31",
  //     deadlineInterior: "2026-08-31",
  //     startDateDesign: "2025-04-01",
  //     startDateConstruction: "2025-09-01",
  //     startDateInterior: "2026-04-01",
  //   },
  //   {
  //     name: "Boutique Hotel",
  //     progressDesign: 65,
  //     progressConstruction: 40,
  //     progressInterior: 15,
  //     deadlineDesign: "2025-08-31",
  //     deadlineConstruction: "2026-02-28",
  //     deadlineInterior: "2026-07-31",
  //     startDateDesign: "2025-05-01",
  //     startDateConstruction: "2025-10-01",
  //     startDateInterior: "2026-05-01",
  //   },
  //   {
  //     name: "Shopping Mall",
  //     progressDesign: 80,
  //     progressConstruction: 55,
  //     progressInterior: 25,
  //     deadlineDesign: "2025-07-31",
  //     deadlineConstruction: "2026-01-31",
  //     deadlineInterior: "2026-06-30",
  //     startDateDesign: "2025-06-01",
  //     startDateConstruction: "2025-11-01",
  //     startDateInterior: "2026-06-01",
  //   },
  //   {
  //     name: "Villa Modern Minimalis 2",
  //     progressDesign: 35,
  //     progressConstruction: 15,
  //     progressInterior: 5,
  //     deadlineDesign: "2025-12-31",
  //     deadlineConstruction: "2026-06-30",
  //     deadlineInterior: "2026-12-31",
  //     startDateDesign: "2025-01-01",
  //     startDateConstruction: "2025-06-01",
  //     startDateInterior: "2026-01-01",
  //   },
  //   {
  //     name: "Residential Complex",
  //     progressDesign: 45,
  //     progressConstruction: 25,
  //     progressInterior: 10,
  //     deadlineDesign: "2025-11-30",
  //     deadlineConstruction: "2026-05-31",
  //     deadlineInterior: "2026-11-30",
  //     startDateDesign: "2025-02-01",
  //     startDateConstruction: "2025-07-01",
  //     startDateInterior: "2026-02-01",
  //   },
  // ];

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
        const nextIndex = (prev + 2) % totalCards;
        return nextIndex;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [totalCards]);

  useEffect(() => {
    
    const newFlippedCards = new Set<number>();
    
    // Add current pair (dengan handling circular)
    newFlippedCards.add(currentPairIndex);
    newFlippedCards.add((currentPairIndex + 1) % totalCards);
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
    
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
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