import { ocr } from "llama-ocr";
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Vérifier que la clé API est présente
  if (!process.env.TOGETHER_API_KEY) {
    console.error('Clé API manquante');
    return res.status(500).json({ error: 'Configuration du serveur incorrecte' });
  }

  // Créer un dossier temporaire s'il n'existe pas
  const uploadDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB max
  });

  try {
    console.log('Début du traitement de la requête');
    
    const [_, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      console.error('Aucun fichier reçu');
      return res.status(400).json({ error: 'Aucun fichier téléversé' });
    }

    console.log('Fichier reçu:', {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size,
      path: file.filepath
    });

    // Vérifier que le fichier existe
    if (!fs.existsSync(file.filepath)) {
      console.error('Fichier non trouvé sur le disque');
      return res.status(500).json({ error: 'Erreur lors du traitement du fichier' });
    }

    try {
      const result = await ocr({
        filePath: file.filepath,
        apiKey: process.env.TOGETHER_API_KEY,
      });

      console.log('Résultat OCR obtenu');

      // Nettoyer le fichier temporaire
      try {
        fs.unlinkSync(file.filepath);
        console.log('Fichier temporaire supprimé');
      } catch (cleanupError) {
        console.error('Erreur lors de la suppression du fichier temporaire:', cleanupError);
      }

      return res.status(200).json({ text: result });

    } catch (ocrError) {
      console.error('Erreur lors de l\'OCR:', ocrError);
      return res.status(500).json({ 
        error: 'Erreur lors de l\'analyse du fichier',
        details: ocrError instanceof Error ? ocrError.message : 'Erreur inconnue lors de l\'OCR'
      });
    }

  } catch (error) {
    console.error('Erreur générale:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du traitement de la requête',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 