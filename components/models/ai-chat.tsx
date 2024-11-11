"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Copy, Check, Sparkles, Split } from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useAuth } from '@/src/app/contexts/AuthContext';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import dynamic from 'next/dynamic';
import { LivePreview } from '../LivePreview';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface PreviewState {
  isVisible: boolean;
  code: string | null;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiCalls, setApiCalls] = useState<number | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [apiCallsRemaining, setApiCallsRemaining] = useState<number | null>(null);
  const [preview, setPreview] = useState<PreviewState>({
    isVisible: false,
    code: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { accessToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    console.log('🔑 Token dans AIChat:', accessToken ? 'Présent' : 'Absent');
    if (accessToken) {
      console.log('🔑 Début du token:', accessToken.substring(0, 20) + '...');
    }
  }, [accessToken]);

  const sendMessage = async (message: string) => {
    try {
        // Récupérer le token d'accès du localStorage
        const accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            setError('Veuillez vous connecter pour utiliser le chat');
            return;
        }

        const response = await fetch('https://appai.charlesagostinelli.com/api/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 503) {
                const estimatedTime = Math.ceil(data.estimated_time * 20);
                setError(`Le modèle se charge, veuillez patienter environ ${estimatedTime} secondes`);

                setTimeout(() => {
                    return sendMessage(message);
                }, (estimatedTime + 2) * 1000);
                return null;
            } else if (response.status === 403) {
                setShowUpgradeModal(true);
                setError('Limite d\'appels API atteinte');
                return null;
            } else if (response.status === 401) {
                setError('Session expirée, veuillez vous reconnecter');
            } else {
                throw new Error(data.error || 'Une erreur est survenue');
            }
            return null;
        }

        setApiCallsRemaining(data.api_calls_remaining);
        setError(null);
        return data.message;

    } catch (error) {
        console.error('Erreur:', error);
        setError('Une erreur est survenue lors de la communication avec l\'IA');
        return null;
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsGenerating(true);

    try {
      const responseMessage = await sendMessage(inputMessage);
      console.log("Response from AI:", responseMessage); // Debug log
      
      if (responseMessage) {
        let displayMessage = responseMessage;
        
        console.log("Checking for JSX code...");
        const hasJSX = containsJSXCode(responseMessage);
        console.log("Has JSX:", hasJSX);
        
        if (hasJSX) {
          const code = extractJSXCode(responseMessage);
          console.log("Extracted code:", code); // Debug log
          displayMessage = responseMessage.replace(/```(?:jsx|tsx)[\s\S]*?```/g, '');
          
          if (code) {
            console.log("Setting preview with code"); // Debug log
            setPreview({
              isVisible: true,
              code
            });
          }
        }

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: displayMessage,
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, une erreur est survenue lors de la communication avec l'IA.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset après 2 secondes
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const MarkdownMessage = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code(props) {
            const { children, className, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return isInline ? (
              <code className="bg-gray-100 rounded px-1 py-0.5" {...rest}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                {...rest as any}
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-2"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const containsJSXCode = (content: string) => {
    console.log("Checking content:", content); // Debug
    const hasJSXBlock = content.includes('```jsx') || content.includes('```tsx');
    console.log("Has JSX block:", hasJSXBlock); // Debug
    return hasJSXBlock;
  };

  const extractJSXCode = (content: string) => {
    const regex = /```(?:jsx|tsx)\s*([\s\S]*?)```/;
    const match = content.match(regex);
    
    if (!match) return null;
    
    // Garder le code TypeScript/TSX tel quel
    let code = match[1].trim();

    // S'assurer que le code est un composant React valide
    if (!code.includes('function') && !code.includes('const')) {
      code = `
        interface ComponentProps {
          children?: React.ReactNode;
        }

        function Component({ children }: ComponentProps) {
          return (
            ${code}
          );
        }
      `;
    }

    return code;
  };
  

  return (
    <Theme appearance="light" accentColor="blue" radius="large">
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center py-8">
          <div className={`flex ${preview.isVisible ? 'space-x-4' : ''} h-[600px] max-h-[80vh] w-full max-w-6xl`}>
            <div className={`flex flex-col h-full ${preview.isVisible ? 'w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
              <div className="flex-none px-6 py-4 border-b rounded-t-xl bg-white">
                <h1 className="text-xl font-semibold text-gray-900">Chat IA</h1>
                <p className="text-sm text-gray-500">Assistant intelligent pour vous aider</p>
              </div>

              <div className="flex-1 overflow-y-auto w-full bg-white">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                        <Bot size={32} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xl font-medium text-gray-900">Commencez une conversation</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Posez vos questions à l'assistant IA
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-4 p-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {/* Avatar pour l'assistant */}
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0">
                            <Avatar.Root className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex-shrink-0">
                              <Bot size={16} className="text-gray-600" />
                            </Avatar.Root>
                          </div>
                        )}

                        {/* Bulle de message */}
                        <div
                          className={`
                            relative group
                            ${message.role === 'user' ? 'items-end' : 'items-start'}
                          `}
                        >
                          {/* Indicateur de copie pour les messages de l'IA */}
                          {message.role === 'assistant' && (
                            <div 
                              className="absolute top-1 right-1 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyMessage(message.content, message.id);
                              }}
                            >
                              <div className="p-1.5 hover:bg-gray-200 rounded-md cursor-pointer">
                                {copiedMessageId === message.id ? (
                                  <Check size={16} className="text-green-500" />
                                ) : (
                                  <Copy size={16} className="text-gray-400 hover:text-gray-600" />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Message principal */}
                          <div className={`
                            px-4 py-2 shadow-sm relative group cursor-pointer
                            ${message.role === 'user'
                              ? 'bg-[#4F46E5] text-white rounded-t-2xl rounded-l-2xl rounded-br-lg max-w-[320px]'
                              : 'bg-[#F3F4F6] text-gray-800 rounded-t-2xl rounded-r-2xl rounded-bl-lg max-w-[480px] hover:bg-gray-100'
                            }
                          `}
                          onClick={message.role === 'assistant' ? () => handleCopyMessage(message.content, message.id) : undefined}
                          >
                            <div className="text-sm whitespace-pre-wrap break-words">
                              {message.role === 'assistant' ? (
                                <MarkdownMessage content={message.content} />
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>

                          {/* Timestamp en petit sous le message */}
                          <div className={`
                            text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity
                            ${message.role === 'user' ? 'text-right mr-1' : 'ml-1'}
                            text-gray-400
                          `}>
                            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Avatar pour l'utilisateur */}
                        {message.role === 'user' && (
                          <div className="flex-shrink-0">
                            <Avatar.Root className="w-8 h-8 overflow-hidden rounded-full flex items-center justify-center bg-[#4F46E5] flex-shrink-0 ring-2 ring-white">
                              {user?.imageUrl ? (
                                <Avatar.Image
                                  src={user.imageUrl}
                                  alt={user.fullName || 'User'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={16} className="text-white" />
                              )}
                            </Avatar.Root>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500 p-6">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">L'assistant réfléchit...</span>
                  </div>
                )}
              </div>
            </div>

            {preview.isVisible && (
              <div className="w-1/2 flex flex-col bg-white rounded-xl border">
                <div className="flex-none px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                    <button
                      onClick={() => setPreview({ isVisible: false, code: null })}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Split size={20} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {preview.code && (
                    <LivePreview 
                      code={preview.code} 
                      isGenerating={isGenerating}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-none border-t bg-white w-full">
          <div className="max-w-4xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-3 text-sm border rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                            transition-all placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className={`
                    p-3 rounded-xl flex items-center justify-center transition-all
                    ${isLoading || !inputMessage.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                    }
                  `}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Ajouter un indicateur d'appels API restants */}
        {apiCallsRemaining !== null && apiCallsRemaining <= 10 && (
          <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
            <p className="text-sm text-yellow-800 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              {apiCallsRemaining === 0 
                ? "Vous avez atteint votre limite d'appels API" 
                : `${apiCallsRemaining} appels API restants`
              }
            </p>
          </div>
        )}

        {/* Modal de mise à niveau */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
            <DialogHeader className="space-y-4">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold">Augmentez vos limites</span>
              </DialogTitle>
              <DialogDescription>
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {apiCallsRemaining === 0 
                        ? "Vous avez atteint votre limite d'utilisation quotidienne !" 
                        : "Vous approchez de votre limite d'utilisation quotidienne !"
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Le plan Pro inclut :</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-sm">10 000 appels API par jour</span>
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-sm">Support prioritaire 24/7</span>
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-sm">Fonctionnalités avancées exclusives</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-6">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
                onClick={() => window.location.href = '/pricing'}
              >
                Passer au Plan Pro
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Continuer avec le plan gratuit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Theme>
  );
} 