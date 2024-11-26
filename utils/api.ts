export async function fetchConversations() {
  try {
    const response = await fetch('/api/proxy/user-conversations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des conversations: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(' Erreur récupération conversations:', error);
    throw error;
  }
} 