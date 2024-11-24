import { ApiResponse } from '@/app/types/chat';

interface SendMessageParams {
  message: string;
  conversation_id: string;
  accessToken: string;
}

interface Conversation {
  conversation_id: string;
  created_at: string;
  messages: {
    content: string;
    is_user_message: boolean;
    timestamp: string;
  }[];
}

export const chatService = {
  async sendMessage({ message, conversation_id, accessToken }: SendMessageParams) {
    console.log("🔄 chatService.sendMessage appelé");
    console.log("📝 Message à envoyer:", message);
    console.log("🔑 Token utilisé:", accessToken?.substring(0, 50) + "...");

    if (!accessToken) {
      throw new Error("Token d'authentification manquant");
    }

    try {
      const response = await fetch('https://appai.charlesagostinelli.com/api/chatMistral/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.replace('Bearer ', '')}`
        },
        body: JSON.stringify({
          message,
          conversation_id
        })
      });

      console.log("🔍 Status de la réponse:", response.status);
      const data = await response.json();
      console.log("📄 Réponse reçue:", JSON.stringify(data).substring(0, 200) + "...");

      if (!response.ok) {
        if (response.status === 503) {
          const estimatedTime = Math.ceil(data.estimated_time || 20);
          throw new Error(`Le modèle se charge, veuillez patienter environ ${estimatedTime} secondes`);
        }
        throw new Error(`Erreur API: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("🚨 Erreur détaillée:", error);
      throw error;
    }
  },

  async fetchConversations(accessToken: string): Promise<Conversation[]> {
    console.log("🔄 Récupération des conversations");
    console.log("🔑 Token utilisé:", accessToken?.substring(0, 50) + "...");

    if (!accessToken) {
      throw new Error("Token d'authentification manquant");
    }

    try {
      const response = await fetch('https://appai.charlesagostinelli.com/api/user-conversations/', {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log("🔍 Status conversations:", response.status);
      const responseText = await response.text();
      console.log("📄 Réponse conversations:", responseText);

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des conversations: ${response.status}`);
      }

      return JSON.parse(responseText);

    } catch (error) {
      console.error("🚨 Erreur récupération conversations:", error);
      throw error;
    }
  }
}; 