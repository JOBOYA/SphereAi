import { ocr } from "llama-ocr";
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  // Vérifier que la clé API est présente
  if (!process.env.TOGETHER_API_KEY) {
    console.error('Clé API manquante');
    return NextResponse.json({ error: 'Configuration du serveur incorrecte' }, { status: 500 });
  }

  try {
    // Créer un dossier temporaire s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Récupérer le fichier depuis la requête
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('Aucun fichier reçu');
      return NextResponse.json({ error: 'Aucun fichier téléversé' }, { status: 400 });
    }

    // Créer un nom de fichier unique
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    // Convertir le fichier en buffer et l'écrire sur le disque
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    console.log('Fichier reçu:', {
      name: file.name,
      type: file.type,
      size: file.size,
      path: filePath
    });

    try {
      const result = await ocr({
        filePath: filePath,
        apiKey: process.env.TOGETHER_API_KEY,
      });

      console.log('Résultat OCR obtenu');

      // Nettoyer le fichier temporaire
      try {
        fs.unlinkSync(filePath);
        console.log('Fichier temporaire supprimé');
      } catch (cleanupError) {
        console.error('Erreur lors de la suppression du fichier temporaire:', cleanupError);
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