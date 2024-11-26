import React, { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import { Message } from '@/app/types/chat';
import { MarkdownMessage } from '@/app/components/MarkdownMessage';

interface ChatMessagesProps {
  messages: Message[];
  loadingPhase: 'dots' | 'typing' | 'preview' | null;
  user: any;
}

const LoadingDots = () => (
  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

const EmptyChat = () => (
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
);

const renderAssistantMessage = (message: Message, messages: Message[], loadingPhase: string | null) => {
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

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loadingPhase, user }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll à chaque nouveau message

  if (messages.length === 0) {
    return <EmptyChat />;
  }

  return (
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

          <div className={`relative group ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`px-4 py-2 shadow-sm relative group ${
                message.role === 'user'
                  ? 'bg-[#4F46E5] text-white rounded-t-2xl rounded-l-2xl rounded-br-lg max-w-[320px]'
                  : 'bg-[#F3F4F6] text-gray-800 rounded-t-2xl rounded-r-2xl rounded-bl-lg max-w-[480px] hover:bg-gray-100'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.role === 'assistant' 
                  ? renderAssistantMessage(message, messages, loadingPhase)
                  : message.content
                }
              </div>
            </div>

            <div
              className={`text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity
                ${message.role === 'user' ? 'text-right mr-1' : 'ml-1'}
                text-gray-400`}
            >
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
      <div ref={messagesEndRef} /> {/* Élément de référence pour le scroll */}
    </div>
  );
}; 