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
      
      if (file instanceof File) {
        Papa.parse(file, {
          complete: (results) => {
            setData(results.data as Array<Array<string>>);
            setIsLoading(false);
          },
          error: (error) => {
            console.error('Erreur lors de la lecture du CSV:', error);
            setIsLoading(false);
          }
        });
      } else if (typeof file === 'string') {
        const response = await fetch(file);
        const text = await response.text();
        const results = Papa.parse(text);
        setData(results.data as Array<Array<string>>);
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
    <div className="csv-preview">
      <div className="csv-container">
        {isLoading ? (
          <div className="loading">Chargement du CSV...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                {currentData.length > 0 && (
                  <tr>
                    {currentData[0].map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {currentData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="csv-controls">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Précédent
        </button>
        <p>
          Page {currentPage} sur {totalPages}
        </p>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Suivant
        </button>
      </div>

      <style jsx>{`
        .csv-preview {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .csv-container {
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
        .table-container {
          width: 100%;
          overflow-x: auto;
          margin: 1rem 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td {
          padding: 0.75rem;
          text-align: left;
          border: 1px solid #eaeaea;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .csv-controls {
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