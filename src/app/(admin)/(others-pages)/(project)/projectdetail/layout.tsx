'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Folder, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Project {
  name: string;
}

interface ProjectDetailsLayoutProps {
  children: React.ReactNode;
}

export default function ProjectDetailsLayout({
  children,
}: ProjectDetailsLayoutProps) {

  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projectnames');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.projects) {
            setProjects(data.projects);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Decoration: Sort & Filter
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects, searchQuery]);

  // Handle active state
  const isActive = useCallback(
    (projectName: string) => {
      // Check if the current URL contains the encoded project name
      // Logic: /projectdetail/PROJECT_NAME
      const encoded = encodeURIComponent(projectName);
      return pathname.includes(encoded);
    },
    [pathname]
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm relative">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:flex lg:flex-col
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${desktopSidebarOpen ? 'lg:translate-x-0 lg:w-72' : 'lg:hidden lg:w-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-brand-500" />
                Projects
              </h2>
              {/* Close Button Mobile */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              {/* Close Button Desktop */}
              <button
                onClick={() => setDesktopSidebarOpen(false)}
                className="hidden lg:block p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title="Collapse Sidebar"
              >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                 </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Link
                  key={project.name}
                  href={`/projectdetail/${encodeURIComponent(project.name)}`}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive(project.name)
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                  `}
                >
                  <span className="truncate">{project.name}</span>
                  {isActive(project.name) && (
                    <ChevronRight className="w-4 h-4 text-brand-500 opacity-100" />
                  )}
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No projects found
              </div>
            )}
          </div>
          
          {/* Footer Stats (Optional) */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-xs text-center text-gray-400">
             {projects.length} Total Projects
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 lg:bg-transparent relative">
        {/* Toggle Button for Desktop (Visible when sidebar is closed) */}
        {!desktopSidebarOpen && (
          <div className="hidden lg:block absolute top-4 left-4 z-20">
             <button
                onClick={() => setDesktopSidebarOpen(true)}
                className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Open Projects Sidebar"
             >
                <Folder className="w-5 h-5 text-brand-500" />
             </button>
          </div>
        )}

        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-white dark:bg-gray-900">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">
            Project Details
          </span>
        </div>

        {/* Child Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </main>
      </div>
    </div>
  );
}