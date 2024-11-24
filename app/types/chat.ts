export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface PreviewState {
  isVisible: boolean;
  content: string | null;
  type: 'text' | 'image' | 'pdf' | 'csv';
  file?: File | null;
}

export interface ConversationMessage {
  content: string;
  is_user_message: boolean;
  timestamp: string;
}

export interface Conversation {
  conversation_id: string;
  created_at: string;
  messages: ConversationMessage[];
}

export interface ApiResponse {
  api_response: string;
  api_calls_remaining?: number;
  error?: string;
  estimated_time?: number;
} 