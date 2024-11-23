import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { Mistral } from '@mistralai/mistralai';
import axios from 'axios';

// Initialisation des clients
const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
});

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: "Fichier audio invalide" }, { status: 400 });
    }

    try {
      console.log("Début du traitement audio...");

      // Convertir le fichier en buffer
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload du fichier à AssemblyAI
      const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload',
        buffer,
        {
          headers: {
            'authorization': ASSEMBLY_API_KEY,
            'content-type': 'application/octet-stream',
          }
        }
      );

      const audioUrl = uploadResponse.data.upload_url;

      // Transcription avec AssemblyAI
      const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl,
          language_code: 'fr'
        },
        {
          headers: {
            'authorization': ASSEMBLY_API_KEY,
            'content-type': 'application/json',
          }
        }
      );

      const transcriptId = transcriptResponse.data.id;

      // Attendre la fin de la transcription
      let transcript;
      while (true) {
        const pollingResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              'authorization': ASSEMBLY_API_KEY
            }
          }
        );

        if (pollingResponse.data.status === 'completed') {
          transcript = pollingResponse.data;
          break;
        } else if (pollingResponse.data.status === 'error') {
          throw new Error('Erreur de transcription');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log("Transcription réussie:", transcript.text);
      console.log("Analyse avec Mistral...");

      // Analyse avec Mistral - Prompt amélioré
      const chatResponse = await mistralClient.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en synthèse de réunions professionnelles. Ta mission est de transformer la transcription brute en un compte-rendu structuré et exploitable.

DIRECTIVES :
- Rester factuel et professionnel
- Extraire uniquement les informations essentielles
- Organiser chronologiquement les décisions et actions
- Identifier clairement les responsabilités et échéances
- Éliminer les digressions et conversations informelles

FORMAT DU COMPTE-RENDU :

# Synthèse de Réunion

## Informations Clés
- Date/Heure : [extraire si mentionné]
- Participants : [extraire si mentionnés]
- Durée : [extraire si mentionné]

## Ordre du Jour
[Liste des sujets abordés]

## Décisions Prises
- [Décision 1]
- [Décision 2]
...

## Actions à Suivre
- [Action 1] - Responsable: [Nom] - Échéance: [Date]
- [Action 2] - Responsable: [Nom] - Échéance: [Date]
...

## Points de Discussion Importants
### [Sujet 1]
- Points essentiels
- Conclusions

### [Sujet 2]
- Points essentiels
- Conclusions

## Prochaines Étapes
- [Étape 1]
- [Étape 2]
...

#reunion #compte-rendu`
          },
          {
            role: "user",
            content: transcript.text
          }
        ]
      });

      if (!chatResponse.choices?.[0]?.message?.content) {
        throw new Error("Réponse invalide de Mistral");
      }

      return NextResponse.json({
        transcription: transcript.text,
        analysis: chatResponse.choices[0].message.content
      });

    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      return NextResponse.json(
        { 
          error: "Erreur lors du traitement",
          details: error.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Erreur générale:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors du traitement de l'audio",
        details: error.message
      },
      { status: 500 }
    );
  }
} 