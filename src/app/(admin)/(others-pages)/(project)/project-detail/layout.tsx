'use client';

import {  useState, useEffect, useCallback } from 'react';
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
  // params,
  children,
}: ProjectDetailsLayoutProps) {
  const router = useRouter();
  // const resolvedParams = use(params);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // const currentProject = resolvedParams?.projectname
  //   ? decodeURIComponent(resolvedParams.projectname)
  //   : '';

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
          
          // // Redirect ke project pertama jika belum ada current project
          // if (!currentProject) {
          //   const encodedName = encodeURIComponent(data.projects[0].name);
          //   router.push(`/project-detail/${encodedName}`);
          // }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [ router]);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProjectClick = useCallback(
    (projectName: string): void => {
      const encodedName = encodeURIComponent(projectName);
      router.push(`/project-detail/${encodedName}`);

      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [router, isMobile]
  );

  const handleToggleSidebar = (): void => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 rounded-lg">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Projects
          </h2>
          <nav className="space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                Loading...
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <button
                  key={project.name}
                  onClick={() => handleProjectClick(project.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    '' === project.name
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm dark:shadow-gray-900/30 px-3  flex items-center justify-between  border-b border-gray-200 dark:border-gray-700 rounded-lg">
          <button
            onClick={handleToggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
            type="button"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            )}
          </button>
         
        </header>

        {/* Content Area */}
        <main className="flex-1 p-3 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}