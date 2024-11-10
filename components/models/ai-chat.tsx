"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Copy, Check } from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useAuth } from '@/src/app/contexts/AuthContext';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiCalls, setApiCalls] = useState<number | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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
                setError('Vous avez épuisé vos appels API disponibles');
            } else if (response.status === 401) {
                setError('Session expirée, veuillez vous reconnecter');
            } else {
                throw new Error(data.error || 'Une erreur est survenue');
            }
            return null;
        }

        setApiCalls(data.api_calls_remaining);
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

    try {
      const responseMessage = await sendMessage(inputMessage);
      
      if (responseMessage) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: responseMessage,
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

  return (
    <Theme appearance="light" accentColor="blue" radius="large">
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="flex flex-col h-[600px] max-h-[80vh] w-full max-w-4xl">
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
                            {message.content}
                          </div>
                          
                          {/* Indicateur de copie pour les messages de l'IA */}
                          {message.role === 'assistant' && (
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {copiedMessageId === message.id ? (
                                <span className="flex items-center gap-1">
                                  <Check size={12} />
                                  Copié
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Copy size={12} />
                                  Cliquer pour copier
                                </span>
                              )}
                            </div>
                          )}
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
      </div>
    </Theme>
  );
} 