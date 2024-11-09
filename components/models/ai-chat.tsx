"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

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

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Je suis l'assistant IA. Je peux vous aider avec vos questions.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
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
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${message.role === 'user' ? 'bg-blue-500' : 'bg-gray-100'}
                        `}>
                          <Avatar.Fallback>
                            {message.role === 'user' ? 
                              <User size={20} className="text-white" /> : 
                              <Bot size={20} className="text-gray-600" />
                            }
                          </Avatar.Fallback>
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