'use client';
import React, { useState, useEffect } from 'react';
import { PIC_MAP, ProjectName, ProjectPIC } from '@/components/PIC/PIC';

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

const ROLE_COLOR_MAP: Record<string, string> = {
  ARCH: "#3b82f6", // blue-500
  INTR: "#a855f7", // purple-500
  DRFT: "#22c55e", // green-500
  PM: "#ec4899",   // pink-500
  PGWS: "#eab308", // yellow-500
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
    
    // Flip every 6 seconds
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => (prev + 1) % totalCards);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [totalCards]);

  useEffect(() => {
    if (totalCards === 0) return;
    
    const newFlippedCards = new Set<number>();
    // Flip current and next card
    newFlippedCards.add(currentPairIndex);
    newFlippedCards.add((currentPairIndex + 1) % totalCards);
    setFlippedCards(newFlippedCards);
  }, [currentPairIndex, totalCards]);

  useEffect(() => {
    fetchProjects();
    // Refresh data every 60 seconds
    const interval = setInterval(() => {
      fetchProjects();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Inline CSS Styles optimized for 4K TV Display (3840 x 2160)
  // Condensed back-face styles to prevent PIC list overflow
  const styles = `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden; /* Prevent scrolling */
      font-family: 'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif;
      background-color: #0f172a; /* Slate 900 */
    }

    /* Force full screen overlay */
    .page-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      padding: 1.5vh; /* Responsive padding */
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      background-color: #0f172a;
    }

    /* 8 Columns Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 1.25vh; /* Responsive gap */
      height: 100%;
      width: 100%;
    }
    
    .card-container {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: pointer;
      perspective: 2000px;
    }
    
    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
      border-radius: 1.6vh;
      box-shadow: 0 0.5vh 1vh -0.2vh rgba(0, 0, 0, 0.4), 0 0.2vh 0.5vh -0.1vh rgba(0, 0, 0, 0.2);
    }
    
    .card-inner.flipped {
      transform: rotateY(180deg);
    }
    
    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 1.6vh;
      padding: 1.5vh; /* Reduced padding from 2vh to save space */
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    /* Front Card Styling */
    .card-front {
      background: linear-gradient(145deg, #1e293b, #0f172a);
      border: 2px solid #334155;
    }
    
    /* Back Card Styling */
    .card-back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      border: 2px solid #4338ca;
    }
    
    .project-title-container {
      flex: 0 0 auto;
      margin-bottom: 1vh; /* Reduced margin */
      display: flex;
      align-items: center;
      justify-content: center;
      height: 3.5vh; /* Reduced height */
      overflow: hidden;
    }
    
    .project-title {
      font-size: 2vh; /* Slightly reduced font */
      line-height: 1.2;
      font-weight: 800;
      color: #f1f5f9;
      text-align: center;
      text-transform: uppercase;
      margin: 0;
      text-shadow: 0 0.2vh 0.4vh rgba(0,0,0,0.6);
      letter-spacing: 0.05em;
      
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Progress Bars - Much thicker for 4K */
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 1.2vh;
      justify-content: center;
      flex: 1;
    }

    .progress-group {
      width: 100%;
    }
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 0.6vh;
    }
    
    .progress-label {
      font-size: 1.6vh;
      font-weight: 600;
      color: #cbd5e1;
      text-transform: capitalize;
      letter-spacing: 0.02em;
    }
    
    .progress-value {
      font-size: 1.8vh;
      font-weight: 700;
      color: #ffffff;
    }
    
    .progress-track {
      height: 1.8vh; /* Very visible track */
      background-color: #334155;
      border-radius: 1vh;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 0.3vh 0.6vh rgba(0,0,0,0.4);
    }
    
    .progress-bar-time {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: #64748b;
      opacity: 0.5;
      border-radius: 1vh;
    }
    
    .progress-bar-actual {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 1vh;
      box-shadow: 0 0 1.5vh rgba(255,255,255,0.3);
    }
    
    .bg-green { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .bg-red { background: linear-gradient(90deg, #ef4444, #dc2626); }
    
    /* PIC List */
    .pic-list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .pic-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.6vh; /* Reduced gap from 1vh */
    }
    
    .pic-item {
      background-color: rgba(255, 255, 255, 0.08); /* slightly more visible */
      padding: 0.7vh 1vh; /* Reduced padding from 1vh 1.5vh */
      border-radius: 0.8vh; /* Proportionally reduced radius */
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(0.5vh);
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .pic-role-container {
      display: flex;
      align-items: center;
      gap: 0.8vh;
    }
    
    .pic-dot {
      width: 1vh; /* Reduced size */
      height: 1vh;
      border-radius: 50%;
      box-shadow: 0 0 0.8vh currentColor;
    }
    
    .pic-role {
      font-size: 1.25vh; /* Reduced font */
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.1em;
    }
    
    .pic-name {
      font-size: 1.45vh; /* Reduced font */
      font-weight: 700;
      color: #f8fafc;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 12vw; /* Ensure wide enough on 4K */
      text-align: right;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      font-size: 4vh;
      color: #94a3b8;
    }
  `;

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

  const getPics = (projectName: string) => {
    if (!PIC_MAP || typeof PIC_MAP !== "object") return null;

    const normalizedName = projectName?.replace(/\\(copy\\)/gi, "").trim().toUpperCase() || "";
    const matchedKey = (Object.keys(PIC_MAP) as ProjectName[]).find((key) => {
      const normalizedKey = key.trim().toUpperCase();
      return (
        normalizedKey === normalizedName ||
        normalizedName.includes(normalizedKey) ||
        normalizedKey.includes(normalizedName)
      );
    });

    return matchedKey ? PIC_MAP[matchedKey] : undefined;
  };

  return (
    <div className="page-container">
      <style>{styles}</style>
      
      {isLoading ? (
        <div className="loading-container">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="loading-container">
          No projects found
        </div>
      ) : (
        <div className="grid">
          {projects.map((project, index) => {
             const timeProgressDesign = calculateTimeProgress(project.startDateDesign, project.deadlineDesign);
             const timeProgressConstruction = calculateTimeProgress(project.startDateConstruction, project.deadlineConstruction);
             const timeProgressInterior = calculateTimeProgress(project.startDateInterior, project.deadlineInterior);
             const isFlipped = flippedCards.has(index);
             const projectPics = getPics(project.name);

             return (
              <div key={`${project.name}-${index}`} className="card-container">
                <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                  {/* Front Side */}
                  <div className="card-face card-front">
                    <div className="project-title-container">
                      <h3 className="project-title" title={project.name}>
                        {project.name}
                      </h3>
                    </div>

                    <div className="progress-section">
                      {[
                        { label: 'Design', actual: project.progressDesign, time: timeProgressDesign },
                        { label: 'Construction', actual: project.progressConstruction, time: timeProgressConstruction },
                        { label: 'Interior', actual: project.progressInterior, time: timeProgressInterior }
                      ].map((item) => (
                        <div key={item.label} className="progress-group">
                          <div className="progress-header">
                            <span className="progress-label">{item.label}</span>
                            <div style={{ display: 'flex', gap: '1vh', alignItems: 'center'}}>
                                <span className="progress-value">{item.actual}%</span>
                            </div>
                          </div>
                          <div className="progress-track">
                             <div 
                                className="progress-bar-time"
                                style={{ width: `${item.time}%` }}
                             />
                             <div 
                                className={`progress-bar-actual ${item.actual >= item.time ? 'bg-green' : 'bg-red'}`} 
                                style={{ width: `${item.actual}%` }}
                             />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="card-face card-back">
                    <div className="project-title-container" style={{height: 'auto', minHeight: '3.5vh'}}>
                      <h3 className="project-title">
                        {project.name}
                      </h3>
                    </div>

                    <div className="pic-list-container">
                        <div className="pic-list">
                        {projectPics ? (
                            Object.entries(projectPics).map(([role, name]) => (
                            <div key={role} className="pic-item">
                                <div className="pic-role-container">
                                <div 
                                    className="pic-dot" 
                                    style={{ backgroundColor: ROLE_COLOR_MAP[role] || '#9ca3af' }} 
                                />
                                <div className="pic-role">{role}</div>
                                </div>
                                <div className="pic-name">
                                {name && name !== "-" ? name : "-"}
                                </div>
                            </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', fontSize: '1.4vh', color: '#94a3b8' }}>
                            No PIC available
                            </div>
                        )}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}