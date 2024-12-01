import React, { useCallback, useState } from 'react';
import { Sparkles, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PreviewState } from '@/app/types/chat';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

const PDFPreview = dynamic(() => import('../PDFPreview'), { ssr: false });
const CSVPreview = dynamic(() => import('../CSVPreview'), { ssr: false });

interface PreviewPanelProps {
  preview: PreviewState;
  extractedPdfText: string | null;
  extractedCsvText?: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onFileUpload: (file: File) => void;
  className?: string;
}

export const PreviewPanel = ({ 
  preview,
  extractedPdfText,
  extractedCsvText,
  isLoading,
  onAnalyze,
  onFileUpload,
  className
}: PreviewPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && (file.type === 'application/pdf' || file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const renderPreview = () => {
    if (!preview.file) return null;

    return (
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Fichier {preview.type.toUpperCase()} chargé</h3>
            <p className="text-sm text-gray-500">
              {preview.file.name} ({(preview.file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
          <label 
            className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 
                       bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 
                       cursor-pointer transition-colors"
          >
            <svg 
              className="w-4 h-4 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Remplacer
            <input
              type="file"
              className="hidden"
              accept=".pdf,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onFileUpload(file);
                }
              }}
            />
          </label>
        </div>
        {preview.type === 'pdf' ? (
          <PDFPreview file={preview.file} />
        ) : (
          <CSVPreview file={preview.file} />
        )}
      </div>
    );
  };

  const shouldShowAnalyzeButton = () => {
    if (isLoading) return false;
    if (preview.type === 'pdf' && extractedPdfText) return true;
    if (preview.type === 'csv') return true;
    return false;
  };

  return (
    <div className={cn(
      "flex flex-col bg-white rounded-xl border overflow-hidden",
      className
    )}>
      <div className="flex-none px-4 sm:px-6 py-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
          {shouldShowAnalyzeButton() && (
            <button
              onClick={onAnalyze}
              disabled={isLoading}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all flex items-center gap-2 text-blue-600 disabled:opacity-50"
            >
              <Sparkles size={16} className="text-blue-500" />
              <span className="text-sm">Analyser</span>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {preview.file ? (
          <div className="p-4 overflow-x-hidden">
            {renderPreview()}
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`h-full flex items-center justify-center p-4 cursor-pointer transition-colors
              ${isDragActive ? 'bg-blue-50' : 'bg-gray-50'}
              border-2 border-dashed rounded-lg m-4
              ${isDragActive ? 'border-blue-400' : 'border-gray-300'}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez un fichier PDF ou CSV'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ou cliquez pour sélectionner un fichier
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 