import React, { useEffect, useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import * as Babel from '@babel/standalone';
import { Code, Eye } from 'lucide-react';


interface LivePreviewProps {
  code: string;
  isGenerating?: boolean;
}

type Tab = 'preview' | 'code';

// Améliorons la fonction transformTypeScriptToJavaScript
const transformTypeScriptToJavaScript = (code: string): string => {
  try {
    // Supprimer les commentaires de type
    let cleanCode = code
      .replace(/\/\/ Types.*$/gm, '')
      .replace(/\/\/ Interface.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//gm, '');

    // Supprimer les blocs de types et interfaces
    cleanCode = cleanCode
      .replace(/interface\s+\w+\s*{[\s\S]*?}/g, '')
      .replace(/type\s+\w+\s*=[\s\S]*?(?=\n\w|$)/g, '')
      .replace(/\[\s*\]\s*;\s*}/g, '') // Supprimer les tableaux vides suivis d'une accolade
      .replace(/\[\s*\]\s*;/g, ''); // Supprimer les tableaux vides

    // Nettoyer les déclarations de composants React
    cleanCode = cleanCode
      .replace(/const\s+(\w+)\.FC\s*=/g, 'const $1 =') // Remplacer .FC par une déclaration normale
      .replace(/:\s*React\.FC(\<.*?\>)?/g, '') // Supprimer les types React.FC
      .replace(/:\s*FC(\<.*?\>)?/g, '') // Supprimer les types FC
      .replace(/:\s*{\s*[^}]*}/g, '') // Supprimer les types d'objets
      .replace(/:\s*\w+(\[\])?/g, '') // Supprimer les annotations de type simples
      .replace(/<[^>]+>/g, '') // Supprimer les génériques
      .replace(/export\s+default\s+/g, '') // Supprimer export default
      .replace(/export\s+/g, ''); // Supprimer export

    // Nettoyer les lignes vides multiples et les espaces
    cleanCode = cleanCode
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();

    // Extraire le nom du composant
    const functionMatch = cleanCode.match(/function\s+([A-Z]\w+)/);
    const constMatch = cleanCode.match(/const\s+([A-Z]\w+)\s*=/);
    const componentName = functionMatch?.[1] || constMatch?.[1] || 'Component';

    // Envelopper le code dans une structure valide
    cleanCode = `
      const { useState, useEffect, Fragment } = React;
      
      // Composant principal
      ${cleanCode}
      
      // Exporter le composant
      return typeof ${componentName} === 'function' ? ${componentName} : (() => ${componentName});
    `;

    console.log('Code nettoyé:', cleanCode);
    return cleanCode;
  } catch (error) {
    console.error('Erreur lors de la transformation du code:', error);
    return code;
  }
};

export function LivePreview({ code, isGenerating = false }: LivePreviewProps) {
  const [liveCode, setLiveCode] = useState(code);
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [error, setError] = useState<string | null>(null);
  const [renderedComponent, setRenderedComponent] = useState<React.ReactNode | null>(null);

  // Fonction pour compiler et rendre le composant
  const compileAndRender = useCallback((sourceCode: string) => {
    try {
      console.log('Code source original:', sourceCode);
      
      // Transformer le code
      const cleanCode = transformTypeScriptToJavaScript(sourceCode);
      console.log('Code nettoyé:', cleanCode);

      // Transformer avec Babel
      const transformedCode = Babel.transform(cleanCode, {
        presets: ['react'],
        filename: 'component.jsx',
        plugins: [
          ['transform-react-jsx', {
            pragma: 'React.createElement',
            pragmaFrag: 'React.Fragment'
          }]
        ]
      }).code || '';
      console.log('Code transformé par Babel:', transformedCode);

      // Créer le composant avec les dépendances nécessaires
      const createComponent = new Function('React', transformedCode);
      const Component = createComponent(React);

      // Props par défaut étendues
      const defaultProps = {
        title: "Titre d'exemple",
        description: "Description d'exemple",
        imageUrl: "https://via.placeholder.com/150",
        links: ["Accueil", "À propos", "Contact"],
        isOpen: true,
        onClose: () => console.log("Fermer"),
        onClick: () => console.log("Click"),
        children: "Contenu d'exemple",
        className: "demo-component",
        style: {
          maxWidth: '100%',
          margin: '0 auto'
        },
        items: ["Item 1", "Item 2", "Item 3"],
        user: {
          name: "John Doe",
          avatar: "https://via.placeholder.com/40"
        },
        theme: "light",
        variant: "primary"
      };

      // Rendre le composant
      setRenderedComponent(
        <div className="preview-content w-full h-full flex items-center justify-center p-4">
          <div className="preview-wrapper relative w-full max-w-2xl">
            <Component {...defaultProps} />
          </div>
        </div>
      );

    } catch (err) {
      console.error('Erreur de compilation:', err);
      setError(err instanceof Error ? err.message : 'Erreur de compilation');
      setRenderedComponent(
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          <p className="font-medium mb-2">Erreur de compilation :</p>
          <pre className="text-sm whitespace-pre-wrap overflow-auto">
            {err instanceof Error ? err.message : 'Erreur inconnue'}
          </pre>
        </div>
      );
    }
  }, []);

  // Effet pour compiler le code quand il change
  useEffect(() => {
    setLiveCode(code);
    if (code) {
      compileAndRender(code);
    }
  }, [code, compileAndRender]);

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
              <div className="h-full flex items-center justify-center">
                <div className="text-sm text-gray-500">
                  Génération du composant...
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                <p className="font-medium mb-2">Erreur :</p>
                <pre className="text-sm whitespace-pre-wrap">{error}</pre>
              </div>
            ) : renderedComponent ? (
              renderedComponent
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                En attente du code...
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