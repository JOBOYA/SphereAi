import React from 'react';

interface ChatHeaderProps {
  apiCallsRemaining: number | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ apiCallsRemaining }) => {
  return (
    <div className="flex-none px-4 sm:px-6 py-3 border-b">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chat IA</h1>
          <p className="text-sm text-gray-500">Assistant intelligent pour vous aider</p>
        </div>
      </div>
    </div>
  );
}; 