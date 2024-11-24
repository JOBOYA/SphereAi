'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, StopCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { useAuth } from '@/app/contexts/AuthContext';

export default function TranscriptionPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");

  const recorderControls = useAudioRecorder({
    audioTrackConstraints: {
      noiseSuppression: true,
      echoCancellation: true,
    },
    onNotAllowedOrFound: (error: Error) => {
      console.error("Erreur de microphone:", error.message);
    }
  });

  const { isRecording, recordingBlob } = recorderControls;

  const { accessToken } = useAuth();

  useEffect(() => {
    if (!recordingBlob) return;
    processAudio(recordingBlob);
  }, [recordingBlob]);

  const processAudio = async (blob: Blob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', blob);

      if (!accessToken) {
        throw new Error('Token d\'accès non disponible');
      }

      const formattedToken = accessToken.startsWith('Bearer ') 
        ? accessToken 
        : `Bearer ${accessToken}`;

      const response = await fetch('/api/transcription', {
        method: 'POST',
        headers: {
          'Authorization': formattedToken,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du traitement audio');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar className="w-64 hidden lg:flex" />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-lg">
                <h1 className="text-2xl font-semibold mb-8 text-center text-gray-800">
                  Transcription Vocale
                </h1>

                <div className="flex flex-col items-center gap-6">
                  {isProcessing && (
                    <div className="flex items-center gap-2 py-2 px-4 bg-indigo-50 rounded-full text-indigo-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Traitement en cours...</span>
                    </div>
                  )}

                  <div className="relative">
                    <AudioRecorder 
                      recorderControls={recorderControls}
                      downloadOnSavePress={false}
                      downloadFileExtension="webm"
                      showVisualizer={true}
                      classes={{
                        AudioRecorderClass: "!bg-transparent !shadow-none",
                        AudioRecorderStartSaveClass: cn(
                          "!w-14 !h-14 !rounded-full !shadow-lg !transition-all !duration-200",
                          isRecording 
                            ? "!bg-red-500 hover:!bg-red-600 !scale-110" 
                            : "!bg-indigo-500 hover:!bg-indigo-600"
                        ),
                        AudioRecorderPauseResumeClass: "hidden",
                        AudioRecorderDiscardClass: "hidden",
                        AudioRecorderTimerClass: "!text-gray-600 !font-medium",
                        AudioRecorderVisualizerClass: cn(
                          "!h-[60px] !w-[300px]",
                          "!bg-gray-50 !rounded-lg !p-4",
                          "!border !border-gray-100",
                          "!shadow-inner"
                        )
                      }}
                    />
                  </div>

                  {!isRecording && !isProcessing && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mic className="h-4 w-4" />
                      <p className="text-sm">
                        Cliquez sur le micro pour commencer
                      </p>
                    </div>
                  )}
                </div>

                {transcription && (
                  <div className="mt-8 space-y-6 animate-in fade-in duration-500">
                    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                      <h2 className="text-lg font-medium mb-3 text-gray-800 flex items-center gap-2">
                        <span>Transcription</span>
                      </h2>
                      <p className="text-gray-600 leading-relaxed">{transcription}</p>
                    </div>
                    
                    {analysis && (
                      <div className="p-6 bg-indigo-50 rounded-lg shadow-sm">
                        <h2 className="text-lg font-medium mb-3 text-indigo-800 flex items-center gap-2">
                          <span>Synthèse</span>
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