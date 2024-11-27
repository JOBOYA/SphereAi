import { useAuth } from "@clerk/nextjs";
import { chatService } from "@/app/services/chat-service";

// Dans votre composant
const loadConversations = async () => {
  try {
    const { getToken } = useAuth();
    const token = await getToken();
    
    if (!token) {
      console.warn('❌ Pas de token disponible');
      return;
    }

    console.log("🔄 Chargement des conversations avec token:", token.substring(0, 20) + "...");
    const conversations = await chatService.fetchConversations(token);
    // Traitement des conversations...
    
  } catch (error) {
    console.error("❌ Erreur chargement conversations:", error);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const { getToken } = useAuth();
    const token = await getToken();
    
    if (!token) {
      console.error('❌ Pas de token disponible');
      throw new Error("Token d'authentification manquant");
    }

    console.log("🔄 Envoi du message avec token:", token.substring(0, 20) + "...");
    
    const response = await chatService.sendMessage({
      message: inputValue,
      conversation_id: currentConversationId,
      accessToken: token
    });

    // ... traitement de la réponse

  } catch (error) {
    console.error("❌ Erreur dans handleSubmit:", error);
    // Afficher un message d'erreur à l'utilisateur
  }
}; 