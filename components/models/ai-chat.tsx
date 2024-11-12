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

const LoadingDots: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div 
      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
      style={{ animationDelay: '0ms' }}
    />
    <div 
      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
      style={{ animationDelay: '150ms' }}
    />
    <div 
      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
      style={{ animationDelay: '300ms' }}
    />
  </div>
);

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
    isVisible: true,
    code: `
      function WelcomeComponent() {
        return (
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bienvenue dans le Preview
            </h2>
            <p className="text-gray-600">
              Le code de vos composants s'affichera ici en temps réel.
            </p>
          </div>
        );
      }
    `
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { accessToken } = useAuth();
  const { user } = useUser();
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeed = 10; // millisecondes entre chaque caractère
  const [loadingPhase, setLoadingPhase] = useState<'dots' | 'typing' | 'preview' | null>(null);

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

  const simulateTyping = (finalText: string) => {
    setIsTyping(true);
    let currentIndex = 0;
    setTypingText("");
    
    const typingInterval = setInterval(() => {
      if (currentIndex < finalText.length) {
        setTypingText(prev => prev + finalText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, typingSpeed);
  };

  const handleLoadingSequence = async (finalText: string, code: string | null) => {
    // Phase 1: Points de chargement
    setLoadingPhase('dots');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Phase 2: Simulation de la saisie
    setLoadingPhase('typing');
    simulateTyping(finalText);
    
    // Phase 3: Affichage du preview (si du code est présent)
    if (code) {
      await new Promise(resolve => setTimeout(resolve, finalText.length * typingSpeed + 500));
      setLoadingPhase('preview');
      setPreview({
        isVisible: true,
        code
      });
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

    const tempAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: 'assistant',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage, tempAiMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsGenerating(true);
    setLoadingPhase('dots');

    try {
      const responseMessage = await sendMessage(inputMessage);
      
      if (responseMessage) {
        let displayMessage = responseMessage;
        let codeToPreview = null;
        
        if (containsJSXCode(responseMessage)) {
          codeToPreview = extractJSXCode(responseMessage);
          displayMessage = responseMessage.replace(/```(?:jsx|tsx)[\s\S]*?```/g, '');
        }

        setLoadingPhase('typing');
        simulateTyping(displayMessage);
        
        setMessages(prev => prev.map(msg => 
          msg.id === tempAiMessage.id 
            ? { ...msg, content: displayMessage }
            : msg
        ));

        if (codeToPreview) {
          await new Promise(resolve => setTimeout(resolve, displayMessage.length * typingSpeed + 500));
          setLoadingPhase('preview');
          setPreview({
            isVisible: true,
            code: codeToPreview
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempAiMessage.id 
          ? { ...msg, content: "Désolé, une erreur est survenue lors de la communication avec l'IA." }
          : msg
      ));
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
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 px-2 sm:px-4 pt-2 pb-0 overflow-y-auto">
          <div className="h-full max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-2 sm:gap-4">
              <div className="flex flex-col bg-white rounded-xl border min-h-[50vh] lg:h-[calc(100vh-8rem)]">
                <div className="flex-none px-4 sm:px-6 py-3 border-b">
                  <h1 className="text-xl font-semibold text-gray-900">Chat IA</h1>
                  <p className="text-sm text-gray-500">Assistant intelligent pour vous aider</p>
                </div>

                <div className="flex-1 overflow-y-auto">
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
                    <div className="w-full space-y-4 p-4 sm:p-6">
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
                                  message.id === messages[messages.length - 1].id ? (
                                    <>
                                      {loadingPhase === 'dots' ? (
                                        <div className="flex items-center justify-start p-2">
                                          <LoadingDots />
                                        </div>
                                      ) : (
                                        <MarkdownMessage content={typingText} />
                                      )}
                                    </>
                                  ) : (
                                    <MarkdownMessage content={message.content} />
                                  )
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
                </div>

                <div className="flex-none border-t bg-white p-2 sm:p-3 lg:hidden">
                  <form onSubmit={handleSubmit}>
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

              <div className="flex flex-col bg-white rounded-xl border min-h-[30vh] lg:h-[calc(100vh-8rem)]">
                <div className="flex-none px-4 sm:px-6 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingPhase === 'preview' ? (
                    <LivePreview 
                      code={preview.code || ''} 
                      isGenerating={isGenerating}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block border-t bg-white mt-auto">
          <div className="max-w-4xl mx-auto w-full p-3">
            <form onSubmit={handleSubmit}>
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
      </div>
    </Theme>
  );
} 