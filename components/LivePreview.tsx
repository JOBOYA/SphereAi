import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import * as Babel from '@babel/standalone';
import Link from 'next/link';

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const renderComponent = () => {
    try {
      // Nettoyer le code plus efficacement
      const cleanCode = code
        // Supprimer les imports
        .replace(/import.*?;/g, '')
        // Supprimer les exports
        .replace(/export\s+default\s+/g, '')
        // Convertir les déclarations de type FC
        .replace(/:\s*FC<.*?>/g, '')
        .replace(/:\s*React\.FC<.*?>/g, '')
        // Supprimer les interfaces et types
        .replace(/interface\s+\w+\s*{[^}]*}/g, '')
        .replace(/type\s+\w+\s*=\s*{[^}]*}/g, '')
        // Convertir les props typées
        .replace(/<PropsWithChildren<.*?>>/g, '')
        // Nettoyer les annotations de type restantes
        .replace(/:\s*\w+(\[\])?/g, '')
        .trim();

      // Transpiler le code JSX en JavaScript
      const transformedCode = Babel.transform(cleanCode, {
        presets: ['react'],
      }).code;

      // Détecter le nom du composant
      const componentNameMatch = cleanCode.match(/(?:function|const)\s+(\w+)/);
      const componentName = componentNameMatch ? componentNameMatch[1] : null;

      if (!componentName) {
        throw new Error("Aucun composant React trouvé dans le code");
      }

      // Créer le composant avec un wrapper pour les props et tous les composants nécessaires
      const createComponent = new Function(
        'React',
        'useState',
        'useEffect',
        'Link',
        `
          const { createElement } = React;
          ${transformedCode}
          const ComponentWrapper = (props) => {
            return createElement(${componentName}, props);
          };
          return ComponentWrapper;
        `
      );

      const Component = createComponent(
        React, 
        React.useState, 
        React.useEffect,
        // Simuler le composant Link pour le preview
        ({ href, children, ...props }: { href: string; children: React.ReactNode; props: any }) => (
          <a 
            href={href} 
            {...props}
            onClick={(e) => {
              e.preventDefault();
              console.log('Navigation vers:', href);
            }}
          >
            {children}
          </a>
        )
      );

      // Props de test adaptées pour une navbar
      const testProps = {
        links: [
          { href: '/', label: 'Accueil' },
          { href: '/about', label: 'À propos' },
          { href: '/contact', label: 'Contact' },
        ],
        logo: 'Logo',
        isLoggedIn: true,
        user: { name: 'John Doe' },
        onLogin: () => console.log('Login clicked'),
        onLogout: () => console.log('Logout clicked'),
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