import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage = ({ content }: MarkdownMessageProps) => {
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  
  const handleCopySnippet = async (code: string, snippetId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSnippetId(snippetId);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <ReactMarkdown
      components={{
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          const snippetId = Math.random().toString(36).substring(7);
          
          if (isInline) {
            return (
              <code className="bg-gray-100 rounded px-1 py-0.5" {...rest}>
                {children}
              </code>
            );
          }

          return (
            <div className="relative group">
              <div 
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopySnippet(String(children), snippetId);
                }}
              >
                <div className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md cursor-pointer">
                  {copiedSnippetId === snippetId ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-gray-300 hover:text-white" />
                  )}
                </div>
              </div>
              <SyntaxHighlighter
                {...rest as any}
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-2"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}; 