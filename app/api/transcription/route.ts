import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant ou invalide' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;

    // Créer un nouveau FormData pour la requête vers votre API
    const apiFormData = new FormData();
    apiFormData.append('audio', audioFile);

    // Faire la requête vers votre API backend avec le token
    const response = await fetch('https://appai.charlesagostinelli.com/api/transcription/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur de transcription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la transcription' },
      { status: 500 }
    );
  }
} 