import React, { useCallback, useState } from 'react';
import { Sparkles, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PreviewState } from '@/app/types/chat';
import { useDropzone } from 'react-dropzone';

const PDFPreview = dynamic(() => import('@/components/PDFPreview'), {
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  ),
  ssr: false
});

interface PreviewPanelProps {
  preview: PreviewState;
  extractedPdfText: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onFileUpload: (file: File) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  preview,
  extractedPdfText,
  isLoading,
  onAnalyze,
  onFileUpload,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div className="flex flex-col bg-white rounded-xl border min-h-[30vh] lg:h-[calc(100vh-8rem)]">
      <div className="flex-none px-4 sm:px-6 py-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
          {extractedPdfText && (
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
      <div className="flex-1 overflow-hidden">
        {preview.type === 'pdf' && preview.file ? (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Fichier PDF chargé</h3>
              <p className="text-sm text-gray-500">
                {preview.file.name} ({(preview.file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
            <PDFPreview file={preview.file} />
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
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez un fichier PDF'}
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