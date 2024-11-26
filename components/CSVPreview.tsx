'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface CSVPreviewProps {
  file: File | string | null;
}

export default function CSVPreview({ file }: CSVPreviewProps) {
  const [data, setData] = useState<Array<Array<string>>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const rowsPerPage = 10;

  useEffect(() => {
    if (!file) return;

    const parseCSV = async () => {
      setIsLoading(true);
      try {
        if (file instanceof File) {
          Papa.parse(file, {
            complete: (results) => {
              if (results.errors.length > 0) {
                console.error('Erreurs lors du parsing CSV:', results.errors);
              }
              setData(results.data as Array<Array<string>>);
              setIsLoading(false);
            },
            error: (error) => {
              console.error('Erreur lors de la lecture du CSV:', error);
              setIsLoading(false);
            },
            header: false,
            skipEmptyLines: true
          });
        } else if (typeof file === 'string') {
          try {
            const response = await fetch(file);
            const text = await response.text();
            const results = Papa.parse(text, {
              header: false,
              skipEmptyLines: true
            });
            setData(results.data as Array<Array<string>>);
          } catch (error) {
            console.error('Erreur lors de la lecture du CSV depuis URL:', error);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur générale lors du parsing CSV:', error);
        setIsLoading(false);
      }
    };

    parseCSV();
  }, [file]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  if (!file) return null;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-hidden min-h-0">
        {isLoading ? (
          <div className="h-full flex justify-center items-center">
            <div>Chargement du CSV...</div>
          </div>
        ) : (
          <div className="h-full overflow-auto p-2 sm:p-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse bg-white shadow-sm">
                <thead>
                  {currentData.length > 0 && (
                    <tr>
                      {currentData[0].map((header, index) => (
                        <th 
                          key={index}
                          className="sticky top-0 bg-gray-50 px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-left z-10 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {currentData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, cellIndex) => (
                        <td 
                          key={cellIndex}
                          className="px-2 sm:px-3 py-2 border border-gray-200 text-left whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-[200px] md:max-w-[300px]"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-6 p-3 sm:p-4 bg-white border-t border-gray-200">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-md 
          bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 
          disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 
          disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700">Page</span>
          <span className="px-2.5 py-1 text-sm font-semibold text-gray-900 bg-gray-100 rounded-md">
            {currentPage}
          </span>
          <span className="text-sm font-medium text-gray-700">sur {totalPages}</span>
        </div>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-md 
          bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 
          disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 
          disabled:cursor-not-allowed transition-colors"
        >
          Suivant
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
} 