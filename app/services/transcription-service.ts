import { chatService } from '@/app/services/chat-service';

interface TranscriptionParams {
  audioFile: Blob;
  accessToken: string;
}

interface TranscriptionResponse {
  transcription: string;
  analysis: string;
}

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!ASSEMBLY_API_KEY || !MISTRAL_API_KEY) {
  throw new Error("Les clés API AssemblyAI et Mistral sont requises");
}

export const transcriptionService = {
  async transcribeAndAnalyze({ audioFile, accessToken }: TranscriptionParams): Promise<TranscriptionResponse> {
    console.log("🔄 transcriptionService.transcribeAndAnalyze appelé");
    console.log('🔑 Token reçu:', accessToken ? 'Présent' : 'Absent');

    if (!accessToken) {
      throw new Error("Token d'authentification manquant");
    }

    const formattedToken = accessToken.startsWith('Bearer ') 
      ? accessToken 
      : `Bearer ${accessToken}`;

    try {
      console.log('🎤 Début de la transcription audio...');

      // 1. Upload the audio file to AssemblyAI
      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLY_API_KEY!
        },
        body: audioFile
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erreur upload AssemblyAI: ${uploadResponse.status}`);
      }

      const { upload_url } = await uploadResponse.json();
      console.log('📤 Audio uploadé avec succès');

      // 2. Start the transcription
      const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLY_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: upload_url,
          language_code: 'fr'
        })
      });

      if (!transcriptResponse.ok) {
        throw new Error(`Erreur transcription AssemblyAI: ${transcriptResponse.status}`);
      }

      const { id } = await transcriptResponse.json();
      console.log('🎯 Transcription démarrée, ID:', id);

      // 3. Poll for the transcription result
      let transcript;
      while (true) {
        const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
          headers: {
            'Authorization': ASSEMBLY_API_KEY!
          }
        });

        const transcriptionResult = await pollingResponse.json();

        if (transcriptionResult.status === 'completed') {
          transcript = transcriptionResult.text;
          console.log('✅ Transcription terminée');
          break;
        } else if (transcriptionResult.status === 'error') {
          throw new Error('Erreur lors de la transcription');
        }

        // Wait for 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('🤖 Envoi à l\'API Mistral...');
      const response = await fetch('https://appai.charlesagostinelli.com/api/chatMistral/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        },
        body: JSON.stringify({
          message: `Vous êtes un assistant spécialisé dans l'analyse de réunions professionnelles. 
          Concentrez-vous uniquement sur les informations pertinentes liées au travail : tâches, décisions, deadlines, responsabilités et points d'action. 
          Ignorez les conversations personnelles ou hors-sujet.
          
          Analysez cette transcription de réunion et fournissez une synthèse structurée des points importants. 
          Si la conversation ne contient pas d'éléments professionnels pertinents, indiquez simplement "Cette conversation ne contient pas d'éléments professionnels à synthétiser."
          
          Transcription : ${transcript}`,
          conversation_id: Date.now().toString()
        })
      });

      console.log('🔄 Token utilisé pour Mistral:', formattedToken.substring(0, 20) + '...');

      console.log('🔄 Statut réponse Mistral:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API Mistral:', errorText);
        throw new Error(`Erreur API Mistral: ${response.status}`);
      }

      const analysisResult = await response.json();
      console.log('✅ Réponse Mistral reçue:', analysisResult);

      console.log('✨ Analyse terminée');
      const result = {
        transcription: transcript,
        analysis: analysisResult.api_response
      };
      console.log('📝 Résultat final:', result);
      return result;

    } catch (error) {
      console.error("🚨 Erreur service transcription:", error);
      throw error;
    }
  }
}; 