'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface Project {
  name: string;
}

interface ProjectDetailsLayoutProps {
  params: Promise<{
    projectname: string;
  }>;
  children: React.ReactNode;
}

export default function ProjectDetailsLayout({
  children,
}: ProjectDetailsLayoutProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjects = async (): Promise<void> => {
      try {
        const response = await fetch('/api/projectnames');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = (await response.json()) as { success: boolean; projects: Project[] };
        if (data.success && data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  useEffect(() => {
    const handleResize = (): void => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Desktop: sidebar always open, Mobile: sidebar closed by default
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProjectClick = useCallback(
    (projectName: string): void => {
      const encodedName = encodeURIComponent(projectName);
      router.push(`/projectdetail/${encodedName}`);

      // Always close sidebar on mobile after selection
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [router, isMobile]
  );

  const handleToggleSidebar = (): void => {
    setSidebarOpen((prev) => !prev);
  };

  const handleOverlayClick = (): void => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 
          transition-transform duration-300 ease-in-out
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Projects
            </h2>
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={handleToggleSidebar}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                type="button"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            )}
          </div>

          {/* Projects List */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                Loading...
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <button
                  key={project.name}
                  onClick={() => handleProjectClick(project.name)}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                  type="button"
                >
                  {project.name}
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No projects found
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 px-4  flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0">
          {/* Toggle button - hanya tampil di mobile */}
          {isMobile && (
            <button
              onClick={handleToggleSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              type="button"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          )}

          <div className="flex items-center gap-2">
            {/* Add any header actions here */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}