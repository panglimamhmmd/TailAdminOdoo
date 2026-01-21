import React from 'react';
import { X, Download, FileText } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: { id: number; name: string; mimetype: string } | null;
  onDownload: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  document,
  onDownload 
}) => {
  if (!isOpen || !document) return null;

  const isImage = document.mimetype.includes('image');
  const isPdf = document.mimetype.includes('pdf');
  const previewUrl = `/api/project-documents/download?id=${document.id}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
             </div>
             <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 max-w-md truncate" title={document.name}>
                  {document.name}
                </h3>
                <p className="text-xs text-gray-500">{document.mimetype}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
            </button>
            <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-950/50 overflow-hidden relative flex items-center justify-center p-4">
            {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    src={previewUrl} 
                    alt={document.name} 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
            ) : isPdf ? (
                <iframe 
                    src={previewUrl}
                    className="w-full h-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
                />
            ) : (
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Preview Not Available</h4>
                    <p className="text-gray-500 max-w-xs mx-auto mb-6">
                        This file type cannot be previewed directly. Please download it to view.
                    </p>
                    <button 
                        onClick={onDownload}
                        className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                    >
                        Download File
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
