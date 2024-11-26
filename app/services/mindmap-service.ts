interface GenerateMindmapParams {
  prompt: string;
  conversation_id: string;
  accessToken: string;
}

export const mindmapService = {
  async generateMindmap({ prompt, conversation_id, accessToken }: GenerateMindmapParams) {
    console.log("🔄 mindmapService.generateMindmap appelé");
    console.log("📝 Prompt à envoyer:", prompt);

    if (!accessToken) {
      throw new Error("Token d'authentification manquant");
    }

    try {
      const response = await fetch('/api/mindmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken
        },
        body: JSON.stringify({ 
          prompt: `[Mindmap] ${prompt}
                  Structure ta réponse en JSON avec ce format exact:
                  {
                    "Concept Central": "${prompt}",
                    "Concept 1": ["Sous-concept 1.1", "Sous-concept 1.2"],
                    "Concept 2": ["Sous-concept 2.1", "Sous-concept 2.2"],
                    "Concept 3": ["Sous-concept 3.1", "Sous-concept 3.2"]
                  }`,
          conversation_id: Date.now().toString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la requête API');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur service mindmap:', error);
      throw error;
    }
  }
}; 