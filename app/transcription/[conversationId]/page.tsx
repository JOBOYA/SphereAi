'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useAuth } from '@/app/contexts/AuthContext';
import { useParams } from 'next/navigation';

export default function TranscriptionHistoryPage() {
  const [transcription, setTranscription] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useAuth();
  const params = useParams();
  const conversationId = params.conversationId;

  useEffect(() => {
    const fetchTranscriptionHistory = async () => {
      try {
        if (!accessToken || !conversationId) return;

        const formattedToken = accessToken.startsWith('Bearer ') 
          ? accessToken 
          : `Bearer ${accessToken}`;

        const response = await fetch('https://appai.charlesagostinelli.com/api/user-conversations/', {
          headers: {
            'Authorization': formattedToken
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'historique');
        }

        const conversations = await response.json();
        const conversation = conversations.find(
          (conv: any) => conv.conversation_id.toString() === conversationId
        );

        if (conversation) {
          // Trouver le message de transcription et le message d'analyse
          const messages = conversation.messages;
          
          // Le premier message contient la transcription
          const transcriptionMsg = messages.find(
            (msg: any) => msg.content.includes('[Transcription]')
          );
          
          // Le message suivant contient l'analyse
          const analysisMsg = messages.find(
            (msg: any) => !msg.is_user_message && !msg.content.includes('[Transcription]')
          );
          
          if (transcriptionMsg) {
            // Extraire uniquement la transcription (enlever le préfixe)
            setTranscription(transcriptionMsg.content.replace('[Transcription] ', ''));
          }
          
          if (analysisMsg) {
            // Utiliser directement le message d'analyse
            setAnalysis(analysisMsg.content);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscriptionHistory();
  }, [accessToken, conversationId]);

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar className="w-64 hidden lg:flex" />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-lg">
                <h1 className="text-2xl font-semibold mb-8 text-center text-gray-800">
                  Historique de Transcription
                </h1>

                {isLoading ? (
                  <div className="text-center text-gray-500">Chargement...</div>
                ) : (
                  <div className="mt-8 space-y-6">
                    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                      <h2 className="text-lg font-medium mb-3 text-gray-800">
                        Transcription
                      </h2>
                      <p className="text-gray-600 leading-relaxed">{transcription}</p>
                    </div>
                    
                    {analysis && (
                      <div className="p-6 bg-indigo-50 rounded-lg shadow-sm">
                        <h2 className="text-lg font-medium mb-3 text-indigo-800">
                          Synthèse
                        </h2>
                        <div 
                          className="text-gray-600 prose prose-indigo max-w-none" 
                          dangerouslySetInnerHTML={{ __html: analysis }} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 