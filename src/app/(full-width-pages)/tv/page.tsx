'use client';
import React, { useState, useEffect } from 'react';
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { ChevronLeftIcon } from '@/icons';
import Link from 'next/link';

export interface ProjectProgress {
  name: string;
  progressDesign: number;
  progressConstruction: number;
  progressInterior: number;
  deadlineDesign: string;
  deadlineConstruction: string;
  deadlineInterior: string;
  startDateDesign: string;
  startDateConstruction: string;
  startDateInterior: string;
}

// Mock PIC data - replace with your actual PIC_MAP
const PIC_DATA: Record<string, { ARCH?: string; INTR?: string; DRFT?: string; PM?: string; PGWS?: string }> = {
  'PROJECT A': { ARCH: 'John', INTR: 'Jane', DRFT: 'Bob', PM: 'Alice', PGWS: 'Charlie' },
  // Add more projects here
};

export default function ProjectList() {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [projects, setProjects] = useState<ProjectProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projectList');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCards = projects.length;

  useEffect(() => {
    if (totalCards === 0) return;
    
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => (prev + 1) % totalCards);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [totalCards]);

  useEffect(() => {
    if (totalCards === 0) return;
    
    const newFlippedCards = new Set<number>();
    newFlippedCards.add(currentPairIndex);
    newFlippedCards.add((currentPairIndex + 1) % totalCards);
    setFlippedCards(newFlippedCards);
  }, [currentPairIndex, totalCards]);

  useEffect(() => {
    fetchProjects();
    
    const interval = setInterval(() => {
      fetchProjects();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const ProjectCard = ({ project, index }: { project: ProjectProgress; index: number }) => {
    const isFlipped = flippedCards.has(index);
    const projectPIC = PIC_DATA[project.name.toUpperCase()] || {};

    return (
      <div 
        onClick={() => handleCardClick(index)}
        style={{ 
          perspective: '1000px',
          cursor: 'pointer'
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s'
          }}
        >
          {/* Front Side */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              border: '1px solid #ccc',
              padding: '12px',
              backgroundColor: 'white'
            }}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>
              {project.name}
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px' }}>Design</span>
                <span style={{ fontSize: '12px' }}>{project.progressDesign}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${project.progressDesign}%`, 
                  height: '100%', 
                  backgroundColor: '#4caf50',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px' }}>Construction</span>
                <span style={{ fontSize: '12px' }}>{project.progressConstruction}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${project.progressConstruction}%`, 
                  height: '100%', 
                  backgroundColor: '#4caf50',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px' }}>Interior</span>
                <span style={{ fontSize: '12px' }}>{project.progressInterior}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${project.progressInterior}%`, 
                  height: '100%', 
                  backgroundColor: '#4caf50',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: '1px solid #ccc',
              padding: '12px',
              backgroundColor: '#f5f5f5',
              overflow: 'hidden'
            }}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>
              {project.name}
            </h3>
            
            <div style={{ fontSize: '12px' }}>
              {Object.entries(projectPIC).map(([role, name]) => (
                <div key={role} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  padding: '4px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd'
                }}>
                  <span style={{ fontWeight: '500' }}>{role}:</span>
                  <span>{name || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#666' }}>
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Projects On Progress</h1>
        
        <ThemeToggleButton />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(8, 1fr)', 
        gap: '12px'
      }}>
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} index={index} />
        ))}
      </div>
    </div>
  );
}