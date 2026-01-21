import { FolderOpen } from 'lucide-react';

export default function ProjectDetailPage() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] text-center p-6">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-brand-50 rounded-full dark:bg-brand-500/10">
          <FolderOpen className="w-10 h-10 text-brand-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Select a Project
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Choose a project from the sidebar to view its detailed analytics, timelines, and financial reports.
        </p>
        
        {/* Optional: Add a subtle arrow pointing left on desktop to prompt action */}
        <div className="hidden lg:block animate-pulse text-brand-500 text-sm font-medium">
          ← Select from the list
        </div>
      </div>
    </div>
  );
}
