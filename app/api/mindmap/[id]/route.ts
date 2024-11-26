import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log("🔑 Auth Header:", authHeader?.substring(0, 20) + "...");
    console.log("🆔 Conversation ID:", params.id);

    if (!authHeader) {
      return NextResponse.json(
        { error: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    // URL pour récupérer les conversations de l'utilisateur
    const url = `https://appai.charlesagostinelli.com/api/user-conversations/`;
    console.log("🌐 URL de l'API:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    console.log("📥 Statut réponse API:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur API:", errorText);
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const conversations = await response.json();
    
    // Trouver la conversation spécifique
    const conversation = conversations.find(
      (conv: any) => conv.conversation_id === params.id
    );

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Extraire le contenu JSON de la réponse de l'API
    const apiResponse = conversation.messages.find(
      (msg: any) => msg.content.includes('[Mindmap]')
    );

    if (!apiResponse) {
      return NextResponse.json(
        { error: "Contenu de mindmap non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      messages: [{ content: apiResponse.content }]
    });

  } catch (error) {
    console.error('🚨 Erreur complète:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 