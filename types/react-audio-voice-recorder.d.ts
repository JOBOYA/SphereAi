declare module 'react-audio-voice-recorder' {
  export interface AudioRecorderProps {
    onRecordingComplete?: (blob: Blob) => void;
    recorderControls?: RecorderControls;
    downloadOnSavePress?: boolean;
    downloadFileExtension?: string;
    showVisualizer?: boolean;
    classes?: {
      AudioRecorderClass?: string;
      AudioRecorderStartSaveClass?: string;
      AudioRecorderPauseResumeClass?: string;
      AudioRecorderDiscardClass?: string;
      AudioRecorderTimerClass?: string;
      AudioRecorderVisualizerClass?: string;
    };
  }

  export interface RecorderControls {
    startRecording: () => void;
    stopRecording: () => void;
    togglePauseResume: () => void;
    recordingBlob?: Blob;
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    mediaRecorder?: MediaRecorder;
  }

  export interface AudioRecorderHookOptions {
    audioTrackConstraints?: MediaTrackConstraints;
    onNotAllowedOrFound?: (error: Error) => void;
  }

  export function useAudioRecorder(options?: AudioRecorderHookOptions): RecorderControls;
  export function AudioRecorder(props: AudioRecorderProps): JSX.Element;
} 