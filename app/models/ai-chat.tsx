"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { Message, PreviewState, Conversation } from '@/app/types/chat';
import { chatService } from '@/app/services/chat-service';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatForm } from '@/components/chat/ChatForm';
import { PreviewPanel } from '@/components/chat/PreviewPanel';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { pdfjs } from 'react-pdf';

const typingSpeed = 0.1;
const chunkSize = 25;

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
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isAddingToHistory, setIsAddingToHistory] = useState(false);
  const sidebarRef = useRef<{ updateConversations: (id: string) => Promise<void> }>();

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
      
      const sidebarRef = (window as any).sidebarRef;
      if (sidebarRef?.updateConversations) {
        console.log('🔄 Mise à jour de l\'historique avec le nouvel ID:', newConversationId);
        sidebarRef.updateConversations(newConversationId);
      }
    }
  }, [pathname]);

  const generateConversationId = () => {
    const timestamp = Date.now();
    return timestamp.toString();
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setLoadingPhase(null);
    }
  };

  const updateConversationHistory = async (newMessage: Message, aiResponse: any) => {
    setIsAddingToHistory(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (accessToken) {
        const formattedToken = accessToken.startsWith('Bearer ') 
          ? accessToken 
          : `Bearer ${accessToken}`;

        await chatService.fetchConversations(formattedToken);
      }
    } finally {
      setIsAddingToHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const controller = new AbortController();
    setAbortController(controller);

    if (!accessToken) {
      setError('Veuillez vous connecter pour utiliser le chat');
      return;
    }

    const formattedToken = accessToken.startsWith('Bearer ') 
      ? accessToken 
      : `Bearer ${accessToken}`;

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
      const response = await chatService.sendMessage({
        message: inputMessage,
        conversation_id: conversationId,
        accessToken: formattedToken
      });

      if (response.error) {
        switch (response.error) {
          case 'unauthorized':
            router.push('/login');
            setError('Session expirée, veuillez vous reconnecter');
            break;
          default:
            throw new Error(response.error);
        }
        return;
      }

      if (response && response.api_response) {
        setLoadingPhase('typing');
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempAiMessage.id 
              ? { ...msg, content: response.api_response }
              : msg
          )
        );

        const sidebarRef = (window as any).sidebarRef;
        if (sidebarRef?.updateConversations) {
          console.log('🔄 Mise à jour de l\'historique après réponse');
          await sidebarRef.updateConversations(conversationId);
        }

        if (response.api_calls_remaining) {
          setApiCallsRemaining(response.api_calls_remaining);
        }
      }
    } catch (error: any) {
      console.error('Erreur dans handleSubmit:', error);
      if (error.message === 'unauthorized') {
        localStorage.removeItem('accessToken');
        router.push('/login');
        setError('Session expirée, veuillez vous reconnecter');
      } else {
        setError('Une erreur est survenue lors de l\'envoi du message');
      }
    } finally {
      setIsLoading(false);
      setLoadingPhase(null);
      setAbortController(null);
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

  const handleFileUpload = async (file: File) => {
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
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Créer un URL pour le fichier
      const fileUrl = URL.createObjectURL(file);
      
      // Charger le worker PDF.js
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      // Charger le document PDF
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      let fullText = '';
      
      // Extraire le texte de chaque page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      // Nettoyer l'URL créé
      URL.revokeObjectURL(fileUrl);
      
      return fullText;
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte:', error);
      throw new Error('Impossible d\'extraire le texte du PDF');
    }
  };

  const loadConversations = async () => {
    try {
      if (!accessToken) return;

      const formattedToken = accessToken.startsWith('Bearer ') 
        ? accessToken 
        : `Bearer ${accessToken}`;

      const conversations = await chatService.fetchConversations(formattedToken);
      setConversations(conversations);

      if (conversationId) {
        const currentConv = conversations.find(
          conv => conv.conversation_id === conversationId
        );
        
        if (currentConv) {
          const formattedMessages = currentConv.messages.map(msg => ({
            id: Date.now().toString() + Math.random(),
            content: msg.content,
            role: msg.is_user_message ? 'user' : 'assistant',
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadConversations();
    }
  }, [accessToken, conversationId]);

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

  const analyzePDFWithAI = async () => {
    if (!extractedPdfText) {
      setError('Aucun texte PDF à analyser');
      return;
    }

    // Créer un nouveau AbortController pour cette requête
    const controller = new AbortController();
    setAbortController(controller);

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

      if (!accessToken) {
        setError('Veuillez vous connecter pour utiliser le chat');
        return;
      }

      const formattedToken = accessToken.startsWith('Bearer ') 
        ? accessToken 
        : `Bearer ${accessToken}`;

      const response = await chatService.sendMessage({
        message: prompt,
        conversation_id: conversationId,
        accessToken: formattedToken
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
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
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempAiMessage.id 
              ? { ...msg, content: "[Analyse arrêtée]" }
              : msg
          )
        );
      } else {
        console.error('Erreur détaillée lors de l\'analyse du PDF:', error);
        setError('Une erreur est survenue lors de l\'analyse du PDF');
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempAiMessage.id 
              ? { ...msg, content: "Désolé, une erreur est survenue lors de l'analyse du PDF." }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      setLoadingPhase(null);
      setAbortController(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('Token au chargement:', token);
    
    if (!token) {
      router.push('/login');
    }
  }, []);

  return (
    <Theme appearance="light" accentColor="blue" radius="large">
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 px-2 sm:px-4 pt-2 pb-0 overflow-y-auto">
          <div className="h-full max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-2 sm:gap-4">
              <div className="flex flex-col bg-white rounded-xl border min-h-[50vh] lg:h-[calc(100vh-8rem)]">
                <ChatHeader apiCallsRemaining={apiCallsRemaining} />
                
                <div className="flex-1 overflow-y-auto">
                  <ChatMessages 
                    messages={messages}
                    loadingPhase={loadingPhase}
                    user={user}
                  />
                </div>

                <div className="flex-none border-t bg-white p-2 sm:p-3">
                  <ChatForm
                    inputMessage={inputMessage}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onInputChange={handleInputChange}
                    onStopGeneration={handleStopGeneration}
                  />
                </div>
              </div>

              <PreviewPanel
                preview={preview}
                extractedPdfText={extractedPdfText}
                isLoading={isLoading}
                onAnalyze={analyzePDFWithAI}
                onFileUpload={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </Theme>
  );
} 