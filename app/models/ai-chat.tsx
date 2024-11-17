"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Copy, Check, Sparkles, Split, Upload, Trash2 } from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useAuth } from '@/app/contexts/AuthContext';
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
import { LivePreview } from '../../components/LivePreview';
import { ocr } from "llama-ocr";
import { Skeleton } from "@/components/ui/skeleton";
import { prompts } from '@/lib/prompts';
import { useRouter, usePathname } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

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
  content: string | null;
  type: 'text' | 'image' | 'pdf';
  file?: File | null;
}

interface ConversationMessage {
  content: string;
  is_user_message: boolean;
  timestamp: string;
}

interface Conversation {
  conversation_id: string;
  created_at: string;
  messages: ConversationMessage[];
}

const typingSpeed = 0.1; // Réduire de 1ms à 0.1ms
const chunkSize = 25; // Augmenter de 5 à 25 caractères par chunk

// Initialiser PDF.js
if (typeof window !== 'undefined') {
  const pdfjs = require('react-pdf/dist/esm/pdf.worker.entry');
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
    content: null,
    type: 'text'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { accessToken } = useAuth();
  const { user } = useUser();
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'dots' | 'typing' | 'preview' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [extractedPdfText, setExtractedPdfText] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔑 Token dans AIChat:', accessToken ? 'Présent' : 'Absent');
    if (accessToken) {
      console.log('🔑 Début du token:', accessToken.substring(0, 20) + '...');
    }
  }, [accessToken]);

  useEffect(() => {
    const pathParts = pathname.split('/');
    const existingConversationId = pathParts[pathParts.length - 1];
    
    if (/^\d+$/.test(existingConversationId)) {
      console.log('ID de conversation trouvé:', existingConversationId);
      setConversationId(existingConversationId);
      if (messages.length === 0) {
        fetchConversationMessages(existingConversationId);
      }
    } else {
      console.log('Création d\'un nouvel ID de conversation');
      const newConversationId = generateConversationId();
      setConversationId(newConversationId);
      router.push(`/chat/${newConversationId}`);
    }
  }, [pathname]);

  const generateConversationId = () => {
    const timestamp = Date.now();
    return timestamp.toString();
  };

  const sendMessage = async (message: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
        
      if (!accessToken) {
        setError('Veuillez vous connecter pour utiliser le chat');
        return null;
      }

      const response = await fetch('https://appai.charlesagostinelli.com/api/chatMistral/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          conversation_id: parseInt(conversationId),
          message: message
        })
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
          return null;
        } else {
          throw new Error(data.error || 'Une erreur est survenue');
        }
      }

      if (!data || !data.api_response) {
        throw new Error('Format de réponse invalide');
      }

      return data;

    } catch (error) {
      throw error;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setLoadingPhase('dots');

    const tempAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, tempAiMessage]);

    try {
      const response = await sendMessage(inputMessage);
      
      if (response && response.api_response) {
        setLoadingPhase('typing');
        
        const finalText = response.api_response;
        const totalChunks = Math.ceil(finalText.length / chunkSize);
        let currentChunk = 0;

        const updateText = () => {
          if (currentChunk < totalChunks) {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, finalText.length);
            const text = finalText.slice(0, end);
            
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === tempAiMessage.id 
                  ? { ...msg, content: text }
                  : msg
              )
            );
            
            currentChunk++;
            if (currentChunk < totalChunks) {
              requestAnimationFrame(updateText);
            } else {
              setLoadingPhase(null);
            }
          }
        };

        requestAnimationFrame(updateText);
        
        if (response.api_calls_remaining) {
          setApiCallsRemaining(response.api_calls_remaining);
        }
      }
    } catch (error) {
      console.error('Erreur dans handleSubmit:', error);
      setError('Une erreur est survenue lors de l\'envoi du message');
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempAiMessage.id 
            ? { ...msg, content: "Désolé, une erreur est survenue lors de l'envoi du message." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
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
    
    let code = match[1].trim();

    if (!code.includes('function') && !code.includes('const')) {
      code = `
        function Component(props) {
          return (
            ${code}
          );
        }
      `;
    }

    return code;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        return;
      }

      setPreview({
        isVisible: true,
        content: `Fichier PDF chargé\n\nNom du fichier: ${file.name}\nTaille: ${(file.size / 1024).toFixed(2)} KB`,
        type: 'pdf',
        file: file
      });

      // Extraire le texte du PDF
      const extractedText = await extractTextFromPDF(file);
      setExtractedPdfText(extractedText);

    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      setError('Une erreur est survenue lors du chargement du fichier');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte:', error);
      throw new Error('Impossible d\'extraire le texte du PDF');
    }
  };

  const PreviewSkeleton = () => (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-[40%] mb-4" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>

      <div className="flex-grow space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[75%]" />
          <Skeleton className="h-4 w-[100%]" />
          <Skeleton className="h-4 w-[90%]" />
        </div>

        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>

        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[100%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
    </div>
  );

  const fetchUserConversations = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('Token non disponible');
        return;
      }

      const response = await fetch('https://appai.charlesagostinelli.com/api/user-conversations/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des conversations');
      }

      const data = await response.json();
      setConversations(data);

      if (conversationId) {
        const currentConversation = data.find(
          (conv: any) => conv.conversation_id === conversationId
        );
        
        if (currentConversation) {
          const formattedMessages = currentConversation.messages.map((msg: any) => ({
            id: Date.now().toString() + Math.random(),
            content: msg.content,
            role: msg.is_user_message ? 'user' : 'assistant',
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserConversations();
    }
  }, [user, conversationId]);

  const fetchConversationMessages = async (convId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch('https://appai.charlesagostinelli.com/api/user-conversations/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const conversations = await response.json();
      console.log('Conversations reçues:', conversations);

      const conversation = conversations.find(
        (conv: any) => String(conv.conversation_id) === String(convId)
      );

      console.log('Conversation trouvée:', conversation);

      if (conversation) {
        const formattedMessages = conversation.messages.map((msg: any) => ({
          id: Date.now().toString() + Math.random(),
          content: msg.content,
          role: msg.is_user_message ? 'user' : 'assistant',
          timestamp: new Date(msg.timestamp)
        }));
        
        console.log('Messages formatés:', formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.log('Conversation non trouvée pour ID:', convId);
        setMessages([]); 
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
    }
  };

  const renderAssistantMessage = (message: Message) => {
    if (message.id === messages[messages.length - 1].id && message.role === 'assistant') {
      if (loadingPhase === 'dots') {
        return (
          <div className="flex items-center justify-start p-2">
            <LoadingDots />
          </div>
        );
      }
    }
    return <MarkdownMessage content={message.content} />;
  };

  const PDFPreview = React.memo(({ file }: { file: File }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
      const fileUrl = URL.createObjectURL(file);
      setUrl(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }, [file]);

    return (
      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl overflow-auto">
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={null}
            className="mx-auto"
          >
            <Page 
              pageNumber={pageNumber} 
              width={600}
              className="mx-auto"
              loading={null}
            />
          </Document>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50"
          >
            Précédent
          </button>
          <span>
            Page {pageNumber} sur {numPages}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  });

  PDFPreview.displayName = 'PDFPreview';

  const analyzePDFWithAI = async () => {
    if (!extractedPdfText) {
      setError('Aucun texte PDF à analyser');
      return;
    }

    const prompt = `Je viens de charger un PDF avec le contenu suivant:\n\n${extractedPdfText}\n\nPouvez-vous analyser ce contenu et me dire de quoi il s'agit ?`;
    
    const pdfMessage: Message = {
      id: Date.now().toString(),
      content: `[PDF Chargé] Veuillez analyser le contenu de ce document.`,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, pdfMessage]);
    
    const tempAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, tempAiMessage]);
    
    try {
      setIsLoading(true);
      setLoadingPhase('dots');

      const response = await sendMessage(prompt);
      
      if (response && response.api_response) {
        setLoadingPhase('typing');
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempAiMessage.id 
              ? { ...msg, content: response.api_response }
              : msg
          )
        );

        if (response.api_calls_remaining) {
          setApiCallsRemaining(response.api_calls_remaining);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse du PDF:', error);
      setError('Une erreur est survenue lors de l\'analyse du PDF');
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempAiMessage.id 
            ? { ...msg, content: "Désolé, une erreur est survenue lors de l'analyse du PDF." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setLoadingPhase(null);
    }
  };

  return (
    <Theme appearance="light" accentColor="blue" radius="large">
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 px-2 sm:px-4 pt-2 pb-0 overflow-y-auto">
          <div className="h-full max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-2 sm:gap-4">
              <div className="flex flex-col bg-white rounded-xl border min-h-[50vh] lg:h-[calc(100vh-8rem)]">
                <div className="flex-none px-4 sm:px-6 py-3 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">Chat IA</h1>
                      <p className="text-sm text-gray-500">Assistant intelligent pour vous aider</p>
                    </div>
                  </div>
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
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0">
                              <Avatar.Root className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex-shrink-0">
                                <Bot size={16} className="text-gray-600" />
                              </Avatar.Root>
                            </div>
                          )}

                          <div
                            className={`
                              relative group
                              ${message.role === 'user' ? 'items-end' : 'items-start'}
                            `}
                          >
                            <div className={`
                              px-4 py-2 shadow-sm relative group
                              ${message.role === 'user'
                                ? 'bg-[#4F46E5] text-white rounded-t-2xl rounded-l-2xl rounded-br-lg max-w-[320px]'
                                : 'bg-[#F3F4F6] text-gray-800 rounded-t-2xl rounded-r-2xl rounded-bl-lg max-w-[480px] hover:bg-gray-100'
                              }
                            `}
                            >
                              <div className="text-sm whitespace-pre-wrap break-words">
                                {message.role === 'assistant' 
                                  ? renderAssistantMessage(message)
                                  : message.content
                                }
                              </div>
                            </div>

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
                  <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-3 text-sm border rounded-xl"
                      disabled={isLoading}
                    />
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
                    >
                      <Upload size={20} className="text-gray-600" />
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading || !inputMessage.trim()}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all
                        ${isLoading || !inputMessage.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                        }`}
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex flex-col bg-white rounded-xl border min-h-[30vh] lg:h-[calc(100vh-8rem)]">
                <div className="flex-none px-4 sm:px-6 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                    {extractedPdfText && (
                      <button
                        onClick={analyzePDFWithAI}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all flex items-center gap-2 text-blue-600 disabled:opacity-50"
                      >
                        <Sparkles size={16} className="text-blue-500" />
                        <span className="text-sm">Analyser avec l'IA</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    {preview.type === 'pdf' && preview.file ? (
                      <div className="p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium">Fichier PDF chargé</h3>
                          <p className="text-sm text-gray-500">
                            {preview.file.name} ({(preview.file.size / 1024).toFixed(2)} KB)
                          </p>
                        </div>
                        <React.Suspense fallback={<div>Chargement du PDF...</div>}>
                          <PDFPreview file={preview.file} />
                        </React.Suspense>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-4 text-gray-500">
                        <div className="text-center">
                          <Upload size={40} className="mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium">Aucun contenu à afficher</p>
                          <p className="text-sm">Téléversez un fichier PDF pour voir son contenu ici</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf"
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 mx-auto"
                          >
                            <Upload size={16} className="text-gray-600" />
                            <span className="text-sm text-gray-600">Importer un PDF</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block border-t bg-white mt-auto">
          <div className="max-w-4xl mx-auto w-full p-3">
            <form onSubmit={handleSubmit} className="flex gap-3 items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-3 text-sm border rounded-xl"
                disabled={isLoading}
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
              >
                <Upload size={20} className="text-gray-600" />
              </button>

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className={`p-3 rounded-xl flex items-center justify-center transition-all
                  ${isLoading || !inputMessage.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                  }`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Theme>
  );
} 