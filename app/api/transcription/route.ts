import { NextRequest, NextResponse } from 'next/server';
import { transcriptionService } from '@/app/services/transcription-service';

export async function POST(req: NextRequest) {
  try {
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

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Fichier audio manquant' },
        { status: 400 }
      );
    }

    const result = await transcriptionService.transcribeAndAnalyze({
      audioFile,
      accessToken: token
    });

    console.log('Résultat de la transcription:', result);

    if (!result.analysis) {
      return NextResponse.json(
        { error: 'Analyse manquante dans la réponse' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur détaillée de transcription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la transcription' },
      { status: 500 }
    );
  }
} 