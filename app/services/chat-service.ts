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

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          const estimatedTime = Math.ceil(data.estimated_time || 20);
          throw new Error(`Le modèle se charge, veuillez patienter environ ${estimatedTime} secondes`);
        }

        if (response.status === 403 || 
            (response.status === 500 && data.error?.includes('insufficient_quota'))) {
          throw new Error('Vous avez épuisé vos appels API disponibles. Veuillez contacter l\'administrateur.');
        }

        if (response.status === 500) {
          console.error("❌ Erreur API:", response.status);
          console.error("📄 Détails erreur:", data);
          throw new Error(data.error || 'Une erreur est survenue lors de la communication avec l\'API');
        }

        throw new Error(data.error || `Erreur API: ${response.status}`);
      }

      console.log("✅ Réponse API:", data);
      return data;

    } catch (error) {
      console.error("🚨 Erreur service chat:", error);
      throw error;
    }
  },

  async fetchConversations(accessToken: string): Promise<Conversation[]> {
    if (!accessToken) {
      throw new Error("Token d'authentification manquant");
    }

    try {
      const response = await fetch('https://appai.charlesagostinelli.com/api/user-conversations/', {
        headers: {
          'Authorization': `Bearer ${accessToken.replace('Bearer ', '')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des conversations: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Conversations récupérées:", data);
      return data;

    } catch (error) {
      console.error("🚨 Erreur récupération conversations:", error);
      throw error;
    }
  }
}; 