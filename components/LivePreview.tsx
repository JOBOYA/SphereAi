import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import * as Babel from '@babel/standalone';
import { Code, Eye } from 'lucide-react';


interface LivePreviewProps {
  code: string;
  isGenerating?: boolean;
}

type Tab = 'preview' | 'code';

export function LivePreview({ code, isGenerating = false }: LivePreviewProps) {
  const [liveCode, setLiveCode] = useState(code);
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    code: string | null;
    error: Error | null;
  }>({ code: null, error: null });

  useEffect(() => {
    setLiveCode(code);
    setError(null);
    setDebugInfo({ code: null, error: null });
  }, [code]);

  const renderComponent = () => {
    let transformedCode = '';
    
    try {
      // Nettoyer le code
      let cleanCode = code
        .replace(/import\s+.*?;/g, '')
        .replace(/export\s+default\s+/g, '')
        .replace(/export\s+{[^}]+};?/g, '')
        .replace(/export\s+/g, '')
        .trim();

      // Extraire le nom du composant
      const functionMatch = cleanCode.match(/function\s+([A-Z]\w+)/);
      const constMatch = cleanCode.match(/const\s+([A-Z]\w+)\s*=/);
      const componentName = functionMatch?.[1] || constMatch?.[1] || 'AIComponent';

      // Transformer le JSX en JS avec Babel
      transformedCode = Babel.transform(cleanCode, {
        filename: 'component.tsx',
        presets: ['react'],
        plugins: [
          ['transform-react-jsx', {
            pragma: 'React.createElement',
            pragmaFrag: 'React.Fragment'
          }]
        ]
      }).code;

      // Préparer le code final sans redéclarer React
      const finalCode = `
        const {
          useState,
          useEffect,
          Fragment,
          createElement
        } = arguments[0];
        
        ${transformedCode}

        return ${componentName};
      `;

      // Créer le composant
      const Component = new Function('React', finalCode)(React);

      // Props par défaut
      const defaultProps = {
        isOpen: true,
        message: "Ceci est un message de confirmation",
        onConfirm: () => console.log("Confirmé"),
        onCancel: () => console.log("Annulé"),
        className: "modern-button",
        style: {
          position: 'relative',
          padding: '10px 20px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '16px',
          fontWeight: 500,
        },
        onClick: () => console.log("Click")
      };

      // Rendre le composant
      return (
        <div className="preview-content w-full h-full flex items-center justify-center">
          <div className="preview-wrapper relative w-full max-w-2xl">
            <Component {...defaultProps} />
          </div>
        </div>
      );

    } catch (err: any) {
      // Mettre à jour les informations de débogage de manière sûre
      const errorInfo = {
        code: transformedCode,
        error: err
      };
      
      // Utiliser setTimeout pour éviter la boucle de rendu
      setTimeout(() => {
        setDebugInfo(errorInfo);
      }, 0);

      return (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          <p className="font-medium mb-2">Erreur dans le composant généré:</p>
          <pre className="text-sm whitespace-pre-wrap">
            {err.message}
            {err.stack && (
              <>
                <br/>
                <br/>
                Stack: {err.stack}
                <br/>
                <br/>
                Code transformé:
                <br/>
                {debugInfo.code || 'Pas de code transformé disponible'}
              </>
            )}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === 'preview' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Eye size={16} />
          Aperçu
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
            ${activeTab === 'code' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Code size={16} />
          Code
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'preview' ? (
          <div className="p-4 bg-gray-50 h-full">
            {isGenerating ? (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse flex items-center justify-center">
                <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium text-blue-600">
                  Génération en cours...
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm h-full">
                {renderComponent()}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full">
            <SyntaxHighlighter
              language="tsx"
              style={oneDark}
              customStyle={{
                margin: 0,
                height: '100%',
                borderRadius: 0,
                opacity: isGenerating ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {liveCode}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
} 