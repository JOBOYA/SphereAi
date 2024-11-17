import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Minus, Plus } from 'lucide-react';

// Configuration du worker PDF.js
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface PDFPreviewProps {
  file: File;
}

const LoadingComponent = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const PDFPreview: React.FC<PDFPreviewProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [url, setUrl] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fileUrl = URL.createObjectURL(file);
    setUrl(fileUrl);
    return () => URL.revokeObjectURL(fileUrl);
  }, [file]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(e.target.value);
    setZoomLevel(newZoom);
    if (contentRef.current) {
      contentRef.current.style.transform = `scale(${newZoom / 100})`;
      contentRef.current.style.transformOrigin = 'top center';
    }
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 200);
    setZoomLevel(newZoom);
    if (contentRef.current) {
      contentRef.current.style.transform = `scale(${newZoom / 100})`;
      contentRef.current.style.transformOrigin = 'top center';
    }
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 50);
    setZoomLevel(newZoom);
    if (contentRef.current) {
      contentRef.current.style.transform = `scale(${newZoom / 100})`;
      contentRef.current.style.transformOrigin = 'top center';
    }
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="p-2 bg-white rounded-md hover:bg-gray-100 border"
              title="Zoom out"
            >
              <Minus size={16} />
            </button>
            <div className="flex items-center gap-2 min-w-[200px]">
              <input
                type="range"
                min="50"
                max="200"
                value={zoomLevel}
                onChange={handleZoomChange}
                className="w-full"
                step="1"
              />
              <span className="text-sm whitespace-nowrap w-16">
                {zoomLevel}%
              </span>
            </div>
            <button
              onClick={zoomIn}
              className="p-2 bg-white rounded-md hover:bg-gray-100 border"
              title="Zoom in"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="px-3 py-1 text-sm bg-white rounded-md hover:bg-gray-100 border disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pageNumber} sur {numPages}
            </span>
            <button
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 text-sm bg-white rounded-md hover:bg-gray-100 border disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center p-4">
          <div ref={contentRef} className="transform-gpu transition-transform duration-100">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<LoadingComponent />}
              noData={<div>Aucun document chargé</div>}
              error={<div>Une erreur est survenue lors du chargement du PDF</div>}
            >
              {numPages > 0 && (
                <Page 
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber}
                  loading={<LoadingComponent />}
                  className="shadow-lg bg-white"
                />
              )}
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview; 