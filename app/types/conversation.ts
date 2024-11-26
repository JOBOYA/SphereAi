export type Message = {
  content: string;
  is_user_message: boolean;
  timestamp: string;
};

export type Conversation = {
  conversation_id: string;
  created_at: string;
  messages: Message[];
}; 