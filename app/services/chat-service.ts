import { ApiResponse } from '@/app/types/chat';

export const sendMessage = async (
  message: string, 
  conversationId: string, 
  accessToken: string,
  signal?: AbortSignal
): Promise<ApiResponse> => {
  try {
    const response = await fetch('https://appai.charlesagostinelli.com/api/chatMistral/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ 
        conversation_id: parseInt(conversationId),
        message: message
      }),
      signal
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      if (response.status === 503) {
        return { 
          error: 'model_loading', 
          estimated_time: data.estimated_time,
          api_response: ''
        };
      } else if (response.status === 403) {
        return { 
          error: 'api_limit_reached',
          api_response: ''
        };
      } else if (response.status === 401) {
        return { 
          error: 'unauthorized',
          api_response: ''
        };
      }
      throw new Error(data.error || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    throw error;
  }
}; 