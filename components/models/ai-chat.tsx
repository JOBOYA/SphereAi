"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
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
  const { accessToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    console.log('🔑 Token dans AIChat:', accessToken ? 'Présent' : 'Absent');
    if (accessToken) {
      console.log('🔑 Début du token:', accessToken.substring(0, 20) + '...');
    }
  }, [accessToken]);

  const chatWithAI = async (message: string) => {
    if (!accessToken) {
      console.error('❌ Token d\'accès manquant pour la requête chat');
      throw new Error('Token d\'accès non disponible');
    }

    console.log('🚀 Envoi de message au chat:', {
      messageLength: message.length,
      hasToken: !!accessToken,
      tokenPreview: accessToken.substring(0, 20) + '...'
    });

    try {
      const url = 'https://appai.charlesagostinelli.com/api/chat/';
      
      const headers = new Headers({
        'Authorization': `Bearer ${accessToken.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });

      console.log('📨 Headers de la requête:', Object.fromEntries(headers.entries()));

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ 
          message: message.trim()
        })
      });

      console.log('📡 Statut de la réponse:', response.status);
      console.log('📥 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Réponse non-JSON reçue:', contentType);
        const text = await response.text();
        console.error('📄 Contenu de la réponse:', text);
        throw new Error('Réponse invalide du serveur');
      }
      
      const data = await response.json();
      console.log('📦 Données reçues:', data);

      if (response.ok) {
        console.log('✅ Réponse du chat reçue:', {
          messageLength: data.message?.length || 0,
          apiCallsRemaining: data.api_calls_remaining
        });
        return data;
      } else {
        console.error('❌ Erreur de réponse du chat:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error || data.detail || 'Erreur inconnue',
          fullResponse: data
        });
        throw new Error(data.error || data.detail || 'Erreur lors de la communication avec le chat');
      }
    } catch (error: any) {
      console.error('💥 Erreur détaillée:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        fullError: error
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    console.log('📝 Nouveau message:', inputMessage);
    
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
      const response = await chatWithAI(inputMessage);
      
      if (response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.message,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        console.log('🤖 Réponse IA ajoutée:', aiResponse.content);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la communication avec l\'IA:', error);
      // Optionnel : Ajouter un message d'erreur dans le chat
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
                <div className="w-full space-y-6 p-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-4 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-4 max-w-[70%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <Avatar.Root className={`
                          w-10 h-10 rounded-full flex items-center justify-center overflow-hidden
                          ${message.role === 'user' ? 'bg-blue-500' : 'bg-gray-100'}
                        `}>
                          {message.role === 'user' ? (
                            user?.imageUrl ? (
                              <Avatar.Image
                                src={user.imageUrl}
                                alt={user.fullName || 'User'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-white" />
                            )
                          ) : (
                            <Bot size={20} className="text-gray-600" />
                          )}
                        </Avatar.Root>
                        
                        <div className={`
                          py-3 px-4 rounded-xl text-sm
                          ${message.role === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-50 text-gray-900 border border-gray-100'
                          }
                        `}>
                          {message.content}
                        </div>
                      </div>
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