import React, { useState } from 'react';
import { FileText, Download, File, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  mimetype: string;
  create_date: string;
  url?: string;
  // We'll calculate the download URL or use Odoo's standard
}

interface DocumentListProps {
  projectId: number;
}

import useSWR from 'swr';
import { DocumentPreviewModal } from './DocumentPreviewModal';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const DocumentList: React.FC<DocumentListProps> = ({ projectId }) => {
  // Use SWR for caching and revalidation
  const { data, isLoading } = useSWR(
    projectId ? `/api/project-documents?projectId=${projectId}` : null, 
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate every time window gets focus
      revalidateIfStale: false, // Trust cache more for documents
      dedupingInterval: 60000 // Cache for 1 minute at least
    }
  );

  const documents: Document[] = data?.success ? data.documents : [];
  
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const getIcon = (mime: string) => {
    if (mime.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const handleDownload = async (doc: Document) => {
    if (downloadingId) return; 
    try {
        setDownloadingId(doc.id);
        const res = await fetch(`/api/project-documents/download?id=${doc.id}`);
        if (!res.ok) throw new Error("Download failed");
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
    } catch (e) {
        console.error(e);
        alert("Failed to download file");
    } finally {
        setDownloadingId(null);
    }
  };

  const handlePreview = (doc: Document) => {
     setPreviewDoc(doc);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span className="ml-3 text-gray-500">Loading documents...</span>
    </div>
  );

  if (!documents || documents.length === 0) return null;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Project Documents
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500">
            {documents.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => handlePreview(doc)}
              className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 group-hover:border-blue-100 dark:group-hover:border-blue-900 transition-colors">
                {getIcon(doc.mimetype || '')}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate group-hover:text-blue-600 transition-colors" title={doc.name}>
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {doc.create_date ? new Date(doc.create_date).toLocaleDateString() : 'Unknown Date'}
                </p>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                disabled={downloadingId === doc.id}
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${downloadingId === doc.id 
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 cursor-wait' 
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }
                `}
                title="Download"
              >
                {downloadingId === doc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <DocumentPreviewModal 
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        onDownload={() => previewDoc && handleDownload(previewDoc)}
      />
    </>
  );
};
