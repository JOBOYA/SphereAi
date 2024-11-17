import React, { useEffect, useState, useCallback } from 'react';
import * as Babel from '@babel/standalone';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Upload } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  isGenerating: boolean;
  onFileUpload?: (file: File) => void;
}

interface DragState {
  isDragging: boolean;
  message: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code, isGenerating, onFileUpload }) => {
  const [renderedComponent, setRenderedComponent] = useState<React.ReactNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    message: 'Déposez votre fichier PDF ici'
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({...prev, isDragging: true}));
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({...prev, isDragging: false}));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({...prev, isDragging: false}));

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile && onFileUpload) {
      onFileUpload(pdfFile);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  useEffect(() => {
    try {
      // Nettoyer le code des imports et types
      let cleanCode = code
        .replace(/import\s+.*?;?\n/g, '')
        .replace(/export\s+default\s+/g, '')
        .replace(/export\s+/g, '')
        .replace(/interface\s+\w+\s*{[\s\S]*?}/g, '')
        .replace(/type\s+\w+\s*=[\s\S]*?;/g, '')
        .replace(/:\s*React\.FC<.*?>/g, '')
        .replace(/:\s*React\.FC/g, '')
        .replace(/:\s*\w+(\[\])?(?=[\s,)}])/g, '')
        .trim();

      // Envelopper le code dans un composant si nécessaire
      if (!cleanCode.includes('function') && !cleanCode.includes('const')) {
        cleanCode = `
          function PreviewComponent(props) {
            return (${cleanCode});
          }
        `;
      }

      // Compiler avec Babel
      const transformedCode = Babel.transform(cleanCode, {
        presets: ['react'],
        plugins: [
          ['transform-react-jsx', {
            pragma: 'React.createElement',
            pragmaFrag: 'React.Fragment'
          }]
        ]
      }).code;

      // Créer une fonction qui retourne le composant
      const createComponent = new Function(
        'React',
        `
        const {
          useState,
          useEffect,
          Fragment,
          createElement,
          useCallback,
          useMemo,
          useRef,
          useContext,
          createContext
        } = React;

        // Composants UI de base avec préfixe UI_
        const UI_Button = props => 
          createElement('button', {
            ...props,
            className: \`px-4 py-2 rounded-md bg-primary text-white \${props.className || ''}\`
          });

        const UI_Card = props => 
          createElement('div', {
            ...props,
            className: \`p-6 rounded-lg border bg-card \${props.className || ''}\`
          });

        const UI_Input = props =>
          createElement('input', {
            ...props,
            className: \`px-3 py-2 border rounded-md \${props.className || ''}\`
          });

        const UI_Text = props =>
          createElement('p', {
            ...props,
            className: \`text-sm text-gray-600 \${props.className || ''}\`
          });

        const UI_Heading = props =>
          createElement('h2', {
            ...props,
            className: \`text-xl font-semibold \${props.className || ''}\`
          });

        ${transformedCode}

        // Retourner le composant avec un nom différent pour éviter les conflits
        return typeof PreviewComponent !== 'undefined' ? PreviewComponent : 
               typeof Component !== 'undefined' ? Component : (() => null);
        `
      );

      // Créer le composant
      const Component = createComponent(React);

      // Props par défaut
      const defaultProps = {
        title: "Titre d'exemple",
        description: "Description d'exemple",
        imageUrl: "https://via.placeholder.com/150",
        onClick: () => console.log("Click"),
        onSubmit: () => console.log("Submit"),
        className: "w-full",
        children: "Contenu",
        items: ["Item 1", "Item 2", "Item 3"]
      };

      // Rendre le composant
      setRenderedComponent(
        <div className="p-4">
          <Component {...defaultProps} />
        </div>
      );
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      setRenderedComponent(null);
    }
  }, [code]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Erreur de compilation :</p>
        <pre className="text-sm whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div 
      className="h-full bg-white relative"
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {dragState.isDragging && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50 border-2 border-dashed border-blue-500 rounded-lg">
          <div className="text-center">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-600 font-medium">{dragState.message}</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <Upload size={16} className="text-gray-600" />
          <span className="text-sm text-gray-600">Importer un PDF</span>
        </button>
      </div>

      {isGenerating ? (
        <div className="p-4 space-y-4">
          <h2 className="text-2xl font-bold">Preview</h2>
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-[90%]" />
            <Skeleton className="h-6 w-[95%]" />
            <Skeleton className="h-6 w-[85%]" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-[92%]" />
            <Skeleton className="h-6 w-[88%]" />
            <Skeleton className="h-6 w-[95%]" />
            <Skeleton className="h-6 w-[90%]" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-[87%]" />
            <Skeleton className="h-6 w-[93%]" />
            <Skeleton className="h-6 w-[89%]" />
            <Skeleton className="h-6 w-[96%]" />
            <Skeleton className="h-6 w-[91%]" />
            <Skeleton className="h-6 w-[94%]" />
            <Skeleton className="h-6 w-[88%]" />
            <Skeleton className="h-6 w-[92%]" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-[89%]" />
            <Skeleton className="h-6 w-[93%]" />
            <Skeleton className="h-6 w-[87%]" />
            <Skeleton className="h-6 w-[95%]" />
            <Skeleton className="h-6 w-[90%]" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ) : (
        renderedComponent
      )}
    </div>
  );
} 