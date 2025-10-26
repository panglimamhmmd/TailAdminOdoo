import { Zap } from 'lucide-react';

interface PageProps {
  params: Promise<{
    projectname: string;
  }>;
}
export default function ProjectDetailPage({ }: PageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 flex items-start gap-4 max-w-lg">
        <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Click on different projects in the sidebar
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            Select any project from the list on the left to view its details and track progress.
          </p>
        </div>
      </div>
    </div>
  );
}
