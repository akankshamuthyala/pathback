import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string, isTranscribed: boolean) => void;
  initialTranscript?: string;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  initialTranscript = '',
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [hasSpeechApi, setHasSpeechApi] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasSpeechApi(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript((prev) => {
          const updated = prev ? `${prev} ${currentTranscript}` : currentTranscript;
          onTranscriptChange(updated, true);
          return updated;
        });
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognitionInstance(recognition);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionInstance) return;

    if (isRecording) {
      recognitionInstance.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionInstance.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Witness Statement (Voice or Text)
        </label>
        {hasSpeechApi ? (
          <button
            type="button"
            onClick={toggleRecording}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/20'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                Listening... (Click to stop)
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                Speak Witness Report
              </>
            )}
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Voice API unavailable; type below
          </span>
        )}
      </div>

      <textarea
        value={transcript}
        onChange={(e) => {
          setTranscript(e.target.value);
          onTranscriptChange(e.target.value, false);
        }}
        rows={4}
        placeholder="Describe what you observed: approximate time, direction of travel, attire, accompanying individuals, or distinctive behaviors..."
        className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
      />

      {transcript && (
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
            <Check className="w-3.5 h-3.5" /> Statement recorded
          </span>
          <span>{transcript.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      )}
    </div>
  );
};
