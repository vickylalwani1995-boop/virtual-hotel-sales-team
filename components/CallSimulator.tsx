"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
  MessageSquare,
  TrendingUp,
  Send,
  Save,
  Repeat,
  AlertTriangle,
} from "lucide-react";
import type { Agent } from "@/lib/agents";
import { AGENTS, getAgent } from "@/lib/agents";
import { iconForAgent } from "@/lib/agent-icons";
import { logActivity } from "@/lib/activity-log";
import type { WorkspaceLead } from "@/lib/workspace";

/* ----- minimal Web Speech API types (cross-browser) ----- */
type SpeechRecognitionResult = {
  readonly transcript: string;
  readonly confidence: number;
};
type SpeechRecognitionResultList = {
  readonly length: number;
  [index: number]: { isFinal: boolean; [index: number]: SpeechRecognitionResult };
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

/* ----- types ----- */
type CallState =
  | "init"
  | "connecting"
  | "speaking"
  | "listening"
  | "thinking"
  | "ended"
  | "error";

type Turn = {
  id: string;
  role: "user" | "agent";
  text: string;
  ts: string;
};

type Analysis = {
  keyTopics: string[];
  actionItems: string[];
  recommendedNextAgent: string;
  followUpSuggestion: string;
  sentiment: "positive" | "neutral" | "negative";
  opportunityScore: number;
};

const SILENCE_TIMEOUT_MS = 2200;
const INIT_USER_MARKER = "__CALL_INIT__";

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* Split a streaming buffer into "sentences ready to speak now" + "tail". */
function splitForSpeech(buf: string): { sentences: string[]; tail: string } {
  const sentences: string[] = [];
  const re = /([^.!?\n]+[.!?\n]+)\s*/g;
  let m: RegExpExecArray | null;
  let lastIdx = 0;
  while ((m = re.exec(buf)) !== null) {
    const s = m[1].trim();
    if (s) sentences.push(s);
    lastIdx = re.lastIndex;
  }
  const tail = buf.slice(lastIdx);
  return { sentences, tail };
}

export function CallSimulator({
  agent,
  hotelProfile,
  lead,
}: {
  agent: Agent;
  hotelProfile: string;
  lead?: WorkspaceLead;
}) {
  const router = useRouter();

  const [state, setState] = useState<CallState>("init");
  const [statusText, setStatusText] = useState("Calling...");
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [interim, setInterim] = useState("");
  const [muted, setMuted] = useState(false);
  const [volumeOn, setVolumeOn] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [callStartMs, setCallStartMs] = useState<number | null>(null);
  const [callEndMs, setCallEndMs] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isCallingRef = useRef(true);
  const utteranceQueueRef = useRef<string[]>([]);
  const ttsActiveRef = useRef(false);
  const silenceTimerRef = useRef<number | null>(null);
  const accumulatedSpeechRef = useRef("");
  const ttsVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const conversationRef = useRef<Turn[]>([]);

  /* ----- TTS voice picker ----- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    function pickVoice() {
      if (!("speechSynthesis" in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      const preferred =
        voices.find((v) => /Google US English/i.test(v.name)) ||
        voices.find((v) => /Microsoft.*Aria/i.test(v.name)) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith("en-us")) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
      if (preferred) ttsVoiceRef.current = preferred;
    }
    pickVoice();
    window.speechSynthesis?.addEventListener?.("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", pickVoice);
    };
  }, []);

  /* ----- TTS helpers ----- */
  const speak = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      if (!volumeOn) {
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.0;
      if (ttsVoiceRef.current) u.voice = ttsVoiceRef.current;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }, [volumeOn]);

  const speakQueueDrain = useCallback(async () => {
    if (ttsActiveRef.current) return;
    ttsActiveRef.current = true;
    while (utteranceQueueRef.current.length > 0 && isCallingRef.current) {
      const next = utteranceQueueRef.current.shift()!;
      await speak(next);
    }
    ttsActiveRef.current = false;
  }, [speak]);

  const queueSpeech = useCallback(
    (sentences: string[]) => {
      if (sentences.length === 0) return;
      utteranceQueueRef.current.push(...sentences);
      void speakQueueDrain();
    },
    [speakQueueDrain],
  );

  const stopTTS = useCallback(() => {
    if (typeof window === "undefined") return;
    utteranceQueueRef.current = [];
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
    ttsActiveRef.current = false;
  }, []);

  const waitForTTSDrain = useCallback(async () => {
    // Wait until queue empties and no utterance is currently speaking
    while (
      isCallingRef.current &&
      (ttsActiveRef.current ||
        utteranceQueueRef.current.length > 0 ||
        (typeof window !== "undefined" &&
          window.speechSynthesis?.speaking))
    ) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }, []);

  /* ----- STT helpers ----- */
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setState("error");
      setStatusText("Voice recognition not supported in this browser");
      toast.error("Speech recognition unavailable. Try Chrome or Edge.");
      return;
    }
    if (muted || !isCallingRef.current) return;

    accumulatedSpeechRef.current = "";
    setInterim("");
    setState("listening");
    setStatusText("Listening to you...");

    const r = new Ctor();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = true;
    if (typeof r.maxAlternatives === "number") r.maxAlternatives = 1;

    function resetSilenceTimer() {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = window.setTimeout(() => {
        // No new speech for SILENCE_TIMEOUT_MS — commit what we have
        r.stop();
      }, SILENCE_TIMEOUT_MS);
    }

    r.onresult = (e) => {
      let final = "";
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) final += text;
        else live += text;
      }
      if (final) {
        accumulatedSpeechRef.current = (
          accumulatedSpeechRef.current +
          " " +
          final
        ).trim();
      }
      setInterim(live);
      resetSilenceTimer();
    };

    r.onerror = (e) => {
      if (e.error === "not-allowed") {
        toast.error("Microphone permission denied. End call to use a different one.");
        setState("error");
        setStatusText("Mic permission denied");
        return;
      }
      if (e.error === "no-speech") {
        // start over
        if (isCallingRef.current) startListening();
        return;
      }
      // generic error — let onend re-evaluate
    };

    r.onend = () => {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setInterim("");
      const said = accumulatedSpeechRef.current.trim();
      accumulatedSpeechRef.current = "";
      if (!isCallingRef.current) return;
      if (!said) {
        // no speech captured -> start over
        startListening();
        return;
      }
      void sendUserTurn(said);
    };

    recognitionRef.current = r;
    try {
      r.start();
      resetSilenceTimer();
    } catch {
      // Already running or blocked
    }
  }, [muted]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  /* ----- Send a user turn to /api/agent-chat, stream, speak ----- */
  const sendUserTurn = useCallback(
    async (text: string) => {
      const userTurn: Turn = {
        id: newId(),
        role: "user",
        text,
        ts: new Date().toISOString(),
      };
      const next = [...conversationRef.current, userTurn];
      conversationRef.current = next;
      setTranscript(next);

      setState("thinking");
      setStatusText("Thinking...");

      // Build chat history for /api/agent-chat
      const history = conversationRef.current.map((t) => ({
        role: t.role === "user" ? "user" : "assistant",
        content: t.text,
      }));

      try {
        const res = await fetch("/api/agent-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: agent.id,
            hotelProfile,
            messages: history,
          }),
        });
        if (!res.ok || !res.body) {
          let msg = "Agent request failed";
          try {
            const j = await res.json();
            msg = j.error ?? msg;
          } catch {
            // ignore
          }
          throw new Error(msg);
        }
        await streamAndSpeak(res.body);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        toast.error(msg);
        setState("error");
        setStatusText("Agent error");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agent.id, hotelProfile],
  );

  const streamAndSpeak = useCallback(
    async (body: ReadableStream<Uint8Array>) => {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let speakBuf = "";
      const agentTurn: Turn = {
        id: newId(),
        role: "agent",
        text: "",
        ts: new Date().toISOString(),
      };
      conversationRef.current = [...conversationRef.current, agentTurn];
      setTranscript([...conversationRef.current]);

      setState("speaking");
      setStatusText("Speaking...");

      while (true) {
        if (!isCallingRef.current) {
          try {
            await reader.cancel();
          } catch {
            // ignore
          }
          return;
        }
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          try {
            const parsed = JSON.parse(data);
            if (typeof parsed.delta === "string") {
              agentTurn.text += parsed.delta;
              speakBuf += parsed.delta;
              const { sentences, tail } = splitForSpeech(speakBuf);
              speakBuf = tail;
              if (sentences.length > 0) queueSpeech(sentences);
              setTranscript([...conversationRef.current]);
            }
          } catch {
            // not JSON — skip
          }
        }
      }
      // Flush any tail
      if (speakBuf.trim()) {
        queueSpeech([speakBuf.trim()]);
        agentTurn.text = (agentTurn.text + "").trim();
      }
      // Wait until TTS finishes everything queued
      await waitForTTSDrain();
      if (!isCallingRef.current) return;
      // After speaking, loop back to listening
      startListening();
    },
    [queueSpeech, startListening, waitForTTSDrain],
  );

  /* ----- Start the call: kick off greeting ----- */
  useEffect(() => {
    let cancelled = false;
    async function start() {
      setState("connecting");
      setStatusText("Calling...");
      setCallStartMs(Date.now());
      try {
        const res = await fetch("/api/agent-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: agent.id,
            hotelProfile,
            messages: [{ role: "user", content: INIT_USER_MARKER }],
          }),
        });
        if (cancelled) return;
        if (!res.ok || !res.body) {
          let msg = "Failed to start call";
          try {
            const j = await res.json();
            msg = j.error ?? msg;
          } catch {
            // ignore
          }
          throw new Error(msg);
        }
        await streamAndSpeak(res.body);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Could not start call";
        toast.error(msg);
        setState("error");
        setStatusText(msg);
      }
    }
    void start();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- End call ----- */
  const endCall = useCallback(() => {
    isCallingRef.current = false;
    stopTTS();
    stopListening();
    setState("ended");
    setStatusText("Call ended");
    setCallEndMs(Date.now());
  }, [stopTTS, stopListening]);

  /* ----- On unmount, hard-stop any audio/mic ----- */
  useEffect(() => {
    return () => {
      isCallingRef.current = false;
      stopTTS();
      stopListening();
    };
  }, [stopTTS, stopListening]);

  /* ----- Mute toggle (stops STT immediately when muting) ----- */
  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (next) {
        stopListening();
        if (state === "listening") {
          setStatusText("Mic muted");
        }
      } else {
        if (state === "listening" || statusText === "Mic muted") {
          startListening();
        }
      }
      return next;
    });
  }

  function toggleVolume() {
    setVolumeOn((v) => {
      const next = !v;
      if (!next) stopTTS();
      return next;
    });
  }

  /* ----- Post-call analysis ----- */
  useEffect(() => {
    if (state !== "ended") return;
    if (transcript.length === 0) return;
    if (analysis || analysisLoading) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    void fetch("/api/call-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: agent.id,
        duration:
          callEndMs && callStartMs ? (callEndMs - callStartMs) / 1000 : 0,
        transcript: transcript.map((t) => ({
          role: t.role,
          text: t.text,
          ts: t.ts,
        })),
      }),
    })
      .then(async (res) => {
        const j = await res.json();
        if (!j.success) throw new Error(j.error ?? "Analysis failed");
        setAnalysis(j.analysis as Analysis);
      })
      .catch((e) => {
        setAnalysisError(
          e instanceof Error ? e.message : "Analysis failed",
        );
      })
      .finally(() => setAnalysisLoading(false));
  }, [state, transcript, agent.id, callStartMs, callEndMs, analysis, analysisLoading]);

  /* ----- Stats ----- */
  const stats = useMemo(() => {
    const userWords = transcript
      .filter((t) => t.role === "user")
      .reduce((sum, t) => sum + t.text.split(/\s+/).filter(Boolean).length, 0);
    const agentWords = transcript
      .filter((t) => t.role === "agent")
      .reduce((sum, t) => sum + t.text.split(/\s+/).filter(Boolean).length, 0);
    const totalWords = userWords + agentWords;
    const durationMs =
      callEndMs && callStartMs ? callEndMs - callStartMs : 0;
    return {
      durationMs,
      userWords,
      agentWords,
      totalWords,
      userPct: totalWords > 0 ? Math.round((userWords / totalWords) * 100) : 0,
      agentPct: totalWords > 0 ? Math.round((agentWords / totalWords) * 100) : 0,
    };
  }, [transcript, callStartMs, callEndMs]);

  /* ----- Save to activity ----- */
  function saveToActivity() {
    if (transcript.length === 0) {
      toast.error("Nothing to save — transcript is empty.");
      return;
    }
    const summary = transcript
      .map((t) => `${t.role === "user" ? "You" : agent.realName}: ${t.text}`)
      .join(" ")
      .slice(0, 120);
    logActivity({
      type: "agent_run",
      agentId: agent.id,
      agentName: `${agent.realName} (call)`,
      preview: summary,
    });
    toast.success("Call saved to Activity log.");
  }

  function generateFollowUp() {
    const ctx = encodeURIComponent(
      transcript
        .map(
          (t) => `${t.role === "user" ? "Caller" : agent.realName}: ${t.text}`,
        )
        .join("\n"),
    );
    const profile = encodeURIComponent(hotelProfile || "");
    router.push(`/agent/03_outbound?profile=${profile}&call=${ctx}`);
  }

  const Icon = iconForAgent(agent.id);

  /* ============================== RENDER ============================== */
  if (state === "ended") {
    return (
      <PostCall
        agent={agent}
        transcript={transcript}
        stats={stats}
        analysis={analysis}
        analysisLoading={analysisLoading}
        analysisError={analysisError}
        onSave={saveToActivity}
        onFollowUp={generateFollowUp}
        onStartAnother={() => router.refresh()}
        onBack={() =>
          router.push(
            `/agent/${agent.id}?profile=${encodeURIComponent(hotelProfile || "")}`
          )
        }
      />
    );
  }

  return (
    <main
      className="fixed inset-0 z-40 flex flex-col text-white"
      style={{
        background:
          "radial-gradient(900px 600px at 50% 0%, rgba(47,143,204,0.25), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(15,76,129,0.30), transparent 65%), linear-gradient(180deg, #07203B 0%, #050F1F 100%)",
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Top bar: state + back-to-agent escape */}
      <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-5">
        <Link
          href={`/agent/${agent.id}?profile=${encodeURIComponent(hotelProfile || "")}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit call
        </Link>
        <button
          type="button"
          onClick={() => setTranscriptOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-sm px-3 py-1.5 text-sm font-semibold text-white/85"
        >
          {transcriptOpen ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
          {transcriptOpen ? "Hide transcript" : "Show transcript"}
        </button>
      </div>

      {/* Center stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-[160px] w-[160px] sm:h-[200px] sm:w-[200px] rounded-full bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] flex items-center justify-center shadow-[0_30px_80px_-20px_rgba(47,143,204,0.55),0_8px_30px_-8px_rgba(15,76,129,0.6)]"
        >
          {/* Pulse rings while listening/speaking */}
          {(state === "listening" || state === "speaking") && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
              <span
                className="absolute -inset-4 rounded-full border border-white/15"
                style={{
                  animation: "ping 3s cubic-bezier(0,0,0.2,1) infinite",
                }}
              />
            </>
          )}
          <Icon className="h-16 w-16 sm:h-20 sm:w-20 text-white" strokeWidth={1.75} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-heading mt-7 text-2xl sm:text-[34px] font-bold text-white"
        >
          {agent.realName}
        </motion.h1>
        <p className="mt-1 text-sm text-white/55 font-semibold tracking-[0.18em] uppercase">
          {agent.designation}
        </p>
        {lead && (
          <p className="mt-2 text-sm text-white/60">
            Calling <span className="font-semibold text-white/80">{lead.fullName}</span>
            {lead.companyName ? ` · ${lead.companyName}` : ""}
          </p>
        )}

        {/* Status text */}
        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-sm px-4 py-2">
          <StatusDot state={state} />
          <span className="text-sm font-semibold text-white">
            {statusText}
          </span>
        </div>

        {/* Live waveform when listening / speaking */}
        <Waveform
          active={state === "listening" || state === "speaking"}
          color={state === "listening" ? "#2F8FCC" : "#7FB3DC"}
        />

        {/* Interim user speech */}
        {state === "listening" && interim && (
          <p className="mt-3 text-sm text-white/70 italic max-w-md text-center px-4 line-clamp-2">
            &ldquo;{interim}&rdquo;
          </p>
        )}
      </div>

      {/* Bottom controls */}
      <div className="relative pb-8 sm:pb-10 px-4">
        <div className="mx-auto flex items-center justify-center gap-5 sm:gap-8">
          <CtrlButton
            label={muted ? "Unmute" : "Mute"}
            Icon={muted ? MicOff : Mic}
            tone={muted ? "warn" : "ghost"}
            onClick={toggleMute}
          />
          <button
            type="button"
            onClick={endCall}
            aria-label="End call"
            className="group inline-flex items-center justify-center h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-[0_20px_50px_-15px_rgba(220,38,38,0.7),0_8px_24px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all"
          >
            <PhoneOff className="h-7 w-7" strokeWidth={2.25} />
          </button>
          <CtrlButton
            label={volumeOn ? "Mute volume" : "Unmute volume"}
            Icon={volumeOn ? Volume2 : VolumeX}
            tone={!volumeOn ? "warn" : "ghost"}
            onClick={toggleVolume}
          />
        </div>
        <p className="mt-4 text-center text-sm text-white/40">
          End call to see transcript + AI analysis.
        </p>
      </div>

      {/* Floating transcript panel (right side) */}
      <AnimatePresence>
        {transcriptOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute top-16 right-3 sm:right-5 z-10 w-[88vw] sm:w-[340px] max-h-[60vh] rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
              <p className="text-sm font-bold tracking-[0.14em] uppercase text-white/85">
                Transcript
              </p>
              <button
                type="button"
                onClick={() => setTranscriptOpen(false)}
                aria-label="Close transcript"
                className="text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {transcript.length === 0 ? (
                <p className="text-sm text-white/55 italic">
                  Conversation will appear here as you speak.
                </p>
              ) : (
                transcript.map((t) => (
                  <div
                    key={t.id}
                    className={`text-sm leading-relaxed ${
                      t.role === "user" ? "text-mhsp-gold" : "text-white"
                    }`}
                  >
                    <span className="block text-sm font-bold tracking-wider uppercase opacity-70">
                      {t.role === "user" ? "You" : agent.realName}
                    </span>
                    <span className="block mt-0.5">{t.text || "…"}</span>
                  </div>
                ))
              )}
              {state === "listening" && interim && (
                <div className="text-sm leading-relaxed text-mhsp-gold/70 italic">
                  <span className="block">&ldquo;{interim}&rdquo;</span>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ============================== sub-components ============================== */

function StatusDot({ state }: { state: CallState }) {
  const color = {
    init: "bg-white/40",
    connecting: "bg-mhsp-gold animate-pulse",
    speaking: "bg-[#7FB3DC] animate-pulse",
    listening: "bg-mhsp-success animate-pulse",
    thinking: "bg-mhsp-gold animate-pulse",
    ended: "bg-white/40",
    error: "bg-[#DC2626]",
  }[state];
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

function Waveform({ active, color }: { active: boolean; color: string }) {
  // 7 bars with staggered animations
  const bars = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div
      aria-hidden="true"
      className={`mt-6 flex items-end gap-1.5 h-10 transition-opacity ${
        active ? "opacity-100" : "opacity-20"
      }`}
    >
      {bars.map((i) => (
        <span
          key={i}
          className="w-1.5 rounded-full"
          style={{
            background: color,
            height: active ? `${20 + ((i * 13) % 28)}%` : "20%",
            animation: active
              ? `vhst-bar 0.9s ease-in-out ${i * 0.08}s infinite alternate`
              : undefined,
            transition: "height 0.18s ease",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes vhst-bar {
          0% {
            transform: scaleY(0.4);
          }
          100% {
            transform: scaleY(1);
          }
        }
        span {
          transform-origin: bottom;
          min-height: 100%;
        }
      `}</style>
    </div>
  );
}

function CtrlButton({
  label,
  Icon,
  tone,
  onClick,
}: {
  label: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: "ghost" | "warn";
  onClick: () => void;
}) {
  const cls =
    tone === "warn"
      ? "bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#FCD34D] hover:bg-[#F59E0B]/25"
      : "bg-white/[0.06] border-white/20 text-white/85 hover:bg-white/[0.12]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full border backdrop-blur-sm transition-all ${cls}`}
    >
      <Icon className="h-5 w-5" strokeWidth={2.25} />
    </button>
  );
}

/* ============================== Post-call view ============================== */

function PostCall({
  agent,
  transcript,
  stats,
  analysis,
  analysisLoading,
  analysisError,
  onSave,
  onFollowUp,
  onStartAnother,
  onBack,
}: {
  agent: Agent;
  transcript: Turn[];
  stats: {
    durationMs: number;
    userWords: number;
    agentWords: number;
    totalWords: number;
    userPct: number;
    agentPct: number;
  };
  analysis: Analysis | null;
  analysisLoading: boolean;
  analysisError: string | null;
  onSave: () => void;
  onFollowUp: () => void;
  onStartAnother: () => void;
  onBack: () => void;
}) {
  const Icon = iconForAgent(agent.id);
  const recommendedAgent = analysis
    ? AGENTS.find((a) => a.id === analysis.recommendedNextAgent)
    : null;

  function fmtDuration(ms: number): string {
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <main>
      {/* Hero band */}
      <section className="relative overflow-hidden border-b border-[#E5ECF4]">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 480px at 14% 0%, rgba(47,143,204,0.10), transparent 60%), radial-gradient(800px 480px at 92% 100%, rgba(15,76,129,0.08), transparent 65%), linear-gradient(180deg, #FCFDFE 0%, #F1F5FA 100%)",
          }}
        />
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-muted hover:text-mhsp-navy transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {agent.realName}
          </button>

          <div className="flex items-start gap-4 sm:gap-5">
            <div className="shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] flex items-center justify-center text-white shadow-[0_8px_22px_-8px_rgba(15,76,129,0.55)]">
              <Icon className="h-7 w-7" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
                <Phone className="h-3.5 w-3.5" />
                Call complete
              </span>
              <h1 className="font-heading mt-3 text-[28px] sm:text-[36px] font-bold leading-tight text-mhsp-navy">
                {agent.realName}
              </h1>
              <p className="text-sm text-mhsp-muted mt-1">
                {agent.designation}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <PostStat
              Icon={Clock}
              label="Duration"
              value={fmtDuration(stats.durationMs)}
            />
            <PostStat
              Icon={MessageSquare}
              label="Words spoken"
              value={`${stats.totalWords} total`}
              sub={`You ${stats.userWords} · Agent ${stats.agentWords}`}
            />
            <PostStat
              Icon={TrendingUp}
              label="Talk-to-listen ratio"
              value={`${stats.userPct}% / ${stats.agentPct}%`}
              sub="You / Agent"
            />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8">
        {/* Transcript */}
        <div className="rounded-2xl border border-[#E5ECF4] bg-white shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F1F4F8]">
            <h2 className="font-heading text-base font-bold text-mhsp-navy">
              Transcript
            </h2>
            <p className="text-sm text-mhsp-muted">
              {transcript.length} turns · {fmtDuration(stats.durationMs)}
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-4">
            {transcript.length === 0 ? (
              <p className="text-sm text-mhsp-muted italic">
                No conversation captured.
              </p>
            ) : (
              transcript.map((t) => (
                <div key={t.id}>
                  <p
                    className={`text-sm font-bold tracking-[0.12em] uppercase ${
                      t.role === "user"
                        ? "text-mhsp-gold"
                        : "text-mhsp-navy"
                    }`}
                  >
                    {t.role === "user" ? "You" : agent.realName}
                  </p>
                  <p className="mt-1 text-sm text-mhsp-text leading-relaxed whitespace-pre-wrap">
                    {t.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analysis + actions */}
        <div className="space-y-4">
          {/* AI analysis card */}
          <div className="rounded-2xl border border-[#E5ECF4] bg-white shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)] overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />
            <div className="px-5 py-4 border-b border-[#F1F4F8] flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-bold text-mhsp-navy">
                  AI analysis
                </h2>
                <p className="text-sm text-mhsp-muted">
                  Topics · action items · sentiment · opportunity score
                </p>
              </div>
              <Sparkles className="h-4 w-4 text-[#1B6EB7]" />
            </div>
            <div className="px-5 py-4 space-y-4">
              {analysisLoading ? (
                <div className="flex items-center gap-2 text-sm text-mhsp-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing transcript…
                </div>
              ) : analysisError ? (
                <div className="flex items-start gap-2 text-sm text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{analysisError}</span>
                </div>
              ) : !analysis ? (
                <p className="text-sm text-mhsp-muted">No analysis yet.</p>
              ) : (
                <>
                  <SentimentBadge
                    sentiment={analysis.sentiment}
                    score={analysis.opportunityScore}
                  />
                  <Section title="Key topics">
                    <ChipList items={analysis.keyTopics} />
                  </Section>
                  <Section title="Action items">
                    <ul className="space-y-1.5">
                      {analysis.actionItems.map((a, i) => (
                        <li
                          key={`a-${i}`}
                          className="flex items-start gap-2 text-sm text-mhsp-text leading-relaxed"
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#1B6EB7] shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </Section>
                  {recommendedAgent && (
                    <Section title="Talk to next">
                      <Link
                        href={`/agent/${recommendedAgent.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#DCE5EF] bg-[#F4F8FC] hover:bg-white text-mhsp-navy px-3 py-2 text-sm font-semibold transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#1B6EB7]" />
                        {recommendedAgent.realName}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Section>
                  )}
                  <Section title="Follow-up suggestion">
                    <p className="text-sm text-mhsp-text leading-relaxed bg-[#FAFCFE] border border-[#E5ECF4] rounded-lg px-3 py-2.5">
                      {analysis.followUpSuggestion}
                    </p>
                  </Section>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-[#E5ECF4] bg-white shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)] p-5 space-y-2.5">
            <button
              type="button"
              onClick={onFollowUp}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:-translate-y-0.5 transition-all"
            >
              <Send className="h-4 w-4" />
              Generate follow-up email
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onSave}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-4 py-3 text-sm font-semibold transition-colors"
            >
              <Save className="h-4 w-4" />
              Save call to Activity
            </button>
            <button
              type="button"
              onClick={onStartAnother}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-4 py-3 text-sm font-semibold transition-colors"
            >
              <Repeat className="h-4 w-4" />
              Start another call
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-mhsp-muted hover:text-mhsp-navy px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {agent.realName}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function PostStat({
  Icon,
  label,
  value,
  sub,
}: {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5ECF4] bg-white p-4 shadow-[0_8px_28px_-12px_rgba(15,76,129,0.10)]">
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white flex items-center justify-center shadow-[0_6px_18px_-8px_rgba(15,76,129,0.5)]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-[0.14em] uppercase text-mhsp-muted">
            {label}
          </p>
          <p className="mt-1 font-numeric text-xl font-bold text-mhsp-navy leading-tight">
            {value}
          </p>
          {sub && <p className="text-sm text-mhsp-muted mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-bold tracking-[0.14em] uppercase text-mhsp-gold mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-sm text-mhsp-muted italic">None.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span
          key={`t-${i}`}
          className="inline-flex items-center rounded-full border border-[#DCE5EF] bg-[#F4F8FC] px-2.5 py-1 text-sm font-semibold text-mhsp-navy"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function SentimentBadge({
  sentiment,
  score,
}: {
  sentiment: Analysis["sentiment"];
  score: number;
}) {
  const cfg = {
    positive: {
      label: "Positive call",
      cls: "bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30",
    },
    neutral: {
      label: "Neutral call",
      cls: "bg-[#F3F4F6] text-mhsp-muted border-[#E5E7EB]",
    },
    negative: {
      label: "Tough call",
      cls: "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]",
    },
  }[sentiment];
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5ECF4] bg-[#FAFCFE] px-3 py-2.5">
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-bold uppercase tracking-[0.12em] ${cfg.cls}`}
      >
        {cfg.label}
      </span>
      <div className="text-right">
        <p className="text-sm text-mhsp-muted">Opportunity</p>
        <p className="font-numeric text-xl font-bold text-mhsp-navy leading-none">
          {Math.round(score)}<span className="text-mhsp-muted/70 text-sm font-semibold">/10</span>
        </p>
      </div>
    </div>
  );
}

