import { ocr } from "llama-ocr";
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  if (!process.env.TOGETHER_API_KEY) {
    console.error('Clé API manquante');
    return NextResponse.json({ error: 'Configuration du serveur incorrecte' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('Aucun fichier reçu');
      return NextResponse.json({ error: 'Aucun fichier téléversé' }, { status: 400 });
    }

    // Utiliser le répertoire temporaire du système
    const tempDir = tmpdir();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(tempDir, fileName);

    try {
      // Convertir le fichier en Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Écrire le fichier dans le répertoire temporaire du système
      await writeFile(filePath, buffer);

      console.log('Fichier temporaire créé:', filePath);

      // Appeler l'OCR
      const result = await ocr({
        filePath,
        apiKey: process.env.TOGETHER_API_KEY,
      });

      console.log('Résultat OCR obtenu');

      // Supprimer le fichier temporaire
      try {
        await writeFile(filePath, ''); // Vider le fichier
        console.log('Fichier temporaire nettoyé');
      } catch (cleanupError) {
        console.error('Erreur lors du nettoyage du fichier temporaire:', cleanupError);
      }

      return NextResponse.json({ text: result });

    } catch (ocrError) {
      console.error('Erreur lors de l\'OCR:', ocrError);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'analyse du fichier',
        details: ocrError instanceof Error ? ocrError.message : 'Erreur inconnue lors de l\'OCR'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du traitement de la requête',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 