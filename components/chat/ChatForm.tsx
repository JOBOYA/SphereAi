import React from 'react';
import { Send, StopCircle } from 'lucide-react';

interface ChatFormProps {
  inputMessage: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStopGeneration: () => void;
}

export const ChatForm: React.FC<ChatFormProps> = ({
  inputMessage,
  isLoading,
  onSubmit,
  onInputChange,
  onStopGeneration,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-3 items-center">
      <input
        type="text"
        value={inputMessage}
        onChange={onInputChange}
        placeholder="Écrivez votre message..."
        className="flex-1 px-4 py-3 text-sm border rounded-xl"
        disabled={isLoading}
      />

      {isLoading ? (
        <button
          type="button"
          onClick={onStopGeneration}
          className="p-3 rounded-xl flex items-center justify-center transition-all bg-red-500 text-white hover:bg-red-600 active:scale-95"
        >
          <StopCircle size={20} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className={`p-3 rounded-xl flex items-center justify-center transition-all
            ${!inputMessage.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
        >
          <Send size={20} />
        </button>
      )}
    </form>
  );
}; 