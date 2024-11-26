'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurez le worker PDF.js avec un CDN plus fiable
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  file: File | string | null;
}

export default function PDFPreview({ file }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  if (!file) return null;

  return (
    <div className="pdf-preview">
      <div className="pdf-container">
        {isLoading && <div className="loading">Chargement du PDF...</div>}
        
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {numPages > 0 ? (
            <div className="pdf-page">
              <Page pageNumber={pageNumber} />
            </div>
          ) : null}
        </Document>
      </div>

      <div className="pdf-controls">
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Précédent
        </button>
        <p>
          Page {pageNumber} sur {numPages}
        </p>
        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Suivant
        </button>
      </div>

      <style jsx>{`
        .pdf-preview {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .pdf-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 500px;
          position: relative;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 1rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .pdf-page {
          margin: 1rem 0;
          border: 1px solid #eaeaea;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          width: 100%;
          display: flex;
          justify-content: center;
          overflow: auto;
        }
        .pdf-page > div {
          max-width: 100% !important;
          height: auto !important;
        }
        .pdf-page canvas {
          max-width: 100% !important;
          height: auto !important;
        }
        :global(.react-pdf__Page) {
          max-width: 100%;
          height: auto !important;
        }
        :global(.react-pdf__Page__canvas) {
          max-width: 100% !important;
          height: auto !important;
        }
        .pdf-controls {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background-color: #0070f3;
          color: white;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
        }
      `}</style>
    </div>
  );
} 