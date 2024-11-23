'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader, StopCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function TranscriptionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingDuration(0);

      // Configuration de l'analyseur audio
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAudioContext(context);
      setAnalyser(analyserNode);
      setAudioData(new Uint8Array(analyserNode.frequencyBinCount));

      // Démarrer l'animation
      startVisualization();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      // D��marrer le timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      // Arrêter la visualisation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);

      const clerkResponse = await fetch('/api/auth/getToken');
      const clerkData = await clerkResponse.json();
      
      if (!clerkData.token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/transcription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkData.token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du traitement');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Erreur lors du traitement audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.getByteTimeDomainData(dataArray);
      
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#60a5fa';
      ctx.beginPath();

      const sliceWidth = WIDTH / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (HEIGHT / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';
      ctx.stroke();

      ctx.beginPath();
      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = HEIGHT - (v * (HEIGHT / 2));

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar className="w-64 hidden lg:flex" />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                  Transcription Vocale
                </h1>

                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-full max-w-2xl h-[200px]">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className={cn(
                        "w-full h-full rounded-lg",
                        "transition-all duration-300",
                        isRecording ? "opacity-100" : "opacity-50"
                      )}
                      style={{ background: 'transparent' }}
                    />
                    {!isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Cliquez sur le micro pour commencer
                      </div>
                    )}
                  </div>

                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={isProcessing}
                      className={cn(
                        "h-16 w-16 rounded-full transition-all duration-300",
                        "bg-blue-500 hover:bg-blue-600 hover:scale-105",
                        "flex items-center justify-center"
                      )}
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-2xl font-mono text-gray-700">
                        {formatDuration(recordingDuration)}
                      </div>
                      <Button
                        onClick={stopRecording}
                        variant="destructive"
                        className={cn(
                          "h-16 w-16 rounded-full transition-all duration-300",
                          "bg-red-500 hover:bg-red-600 hover:scale-105",
                          "flex items-center justify-center",
                          "animate-pulse"
                        )}
                      >
                        <StopCircle className="h-8 w-8" />
                      </Button>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Traitement en cours...</span>
                    </div>
                  )}
                </div>

                {transcription && (
                  <div className="mt-12 space-y-8">
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">Transcription</h2>
                      <p className="whitespace-pre-wrap text-gray-700">{transcription}</p>
                    </div>
                    
                    {analysis && (
                      <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <h2 className="text-xl font-semibold mb-4 text-blue-800">Synthèse</h2>
                        <div 
                          className="prose max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ 
                            __html: analysis.replace(/\n/g, '<br/>').replace(/\[([^\]]+)\]/g, '<span class="text-blue-600">$1</span>') 
                          }} 
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