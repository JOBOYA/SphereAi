import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import * as Babel from '@babel/standalone';

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const renderComponent = () => {
    try {
      // Nettoyer le code
      const cleanCode = code
        .replace(/import.*?;/g, '')
        .replace(/export\s+default\s+/g, '')
        .replace(/:\s*React\.FC<.*?>/g, '')
        .replace(/type\s+.*?;\s*/g, '')
        .replace(/interface\s+.*?\}\s*/g, '')
        .trim();

      // Transpiler le code JSX en JavaScript
      const transformedCode = Babel.transform(cleanCode, {
        presets: ['react'],
      }).code;

      // Créer le composant
      const createComponent = new Function(
        'React',
        'useState',
        'useEffect',
        `
          ${transformedCode}
          return CardTwitter || Card;
        `
      );

      const Component = createComponent(React, React.useState, React.useEffect);

      // Props de test
      const testProps = {
        username: "JohnDoe",
        name: "John Doe",
        tweet: "Ceci est un tweet d'exemple!",
        image: "https://picsum.photos/500/300",
        date: "Il y a 2h",
        content: "Contenu du tweet"
      };

      return <Component {...testProps} />;
    } catch (error: any) {
      console.error('Erreur de rendu:', error);
      return (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          Erreur de rendu du composant: {error.message}
        </div>
      );
    }
  };

  return (
    <div className="h-full grid grid-rows-2 gap-4">
      <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          {renderComponent()}
        </div>
      </div>

      <div className="overflow-auto rounded-lg">
        <SyntaxHighlighter
          language="tsx"
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
} 