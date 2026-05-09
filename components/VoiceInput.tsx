"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string; isFinal: boolean }>> }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
};

const SILENCE_TIMEOUT_MS = 5000;

export function VoiceInput({
  onTranscript,
  onComplete,
  disabled,
  className = "",
}: {
  onTranscript: (text: string) => void;
  onComplete?: (finalText: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscriptRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (Ctor) setSupported(true);
  }, []);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current?.abort?.();
      } catch {}
    };
  }, []);

  function clearSilenceTimer() {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  function resetSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    }, SILENCE_TIMEOUT_MS);
  }

  function start() {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      lastTranscriptRef.current = transcript;
      onTranscript(transcript);
      resetSilenceTimer();
    };
    rec.onend = () => {
      clearSilenceTimer();
      setListening(false);
      onComplete?.(lastTranscriptRef.current);
      lastTranscriptRef.current = "";
      recognitionRef.current = null;
    };
    rec.onerror = (e) => {
      clearSilenceTimer();
      setListening(false);
      const code = e?.error || "unknown";
      if (code === "not-allowed" || code === "service-not-allowed") {
        toast.error("Microphone permission denied");
      } else if (code === "no-speech") {
        // silent — natural end
      } else if (code !== "aborted") {
        toast.error(`Voice error: ${code}`);
      }
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
      resetSilenceTimer();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start";
      toast.error(`Voice error: ${msg}`);
      setListening(false);
    }
  }

  function stop() {
    try {
      recognitionRef.current?.stop();
    } catch {}
    clearSilenceTimer();
  }

  function handleClick() {
    if (disabled) return;
    if (listening) stop();
    else start();
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={listening ? "Stop listening" : "Start voice input"}
      title={listening ? "Listening… click to stop" : "Voice input"}
      className={`relative shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        listening
          ? "bg-red-600 text-white shadow-[0_0_0_4px_rgba(220,38,38,0.18)]"
          : "bg-mhsp-gold hover:bg-mhsp-gold-soft text-white"
      } ${className}`}
    >
      {listening && (
        <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
      )}
      <span className="relative">
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </span>
    </button>
  );
}
