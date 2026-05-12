"use client";

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowUp,
  Loader2,
  MoreVertical,
  Trash2,
  Download,
  FileText,
  X,
  ChevronDown,
} from "lucide-react";
import type { Agent } from "@/lib/agents";
import {
  ChatMessage,
  clearChat,
  loadChat,
  newId,
  saveChat,
} from "@/lib/agent-chat-history";
import { quickActionsFor } from "@/lib/quick-actions";
import { VoiceInput } from "@/components/VoiceInput";
import { LeadCaptureBar } from "@/components/LeadCaptureBar";
import { useDemoMode } from "@/lib/demo-mode";
import { addNotification } from "@/lib/notifications";
import {
  getWorkspace,
  generateTeamBriefing,
  logWorkspaceActivity,
  seedDemoWorkspace,
  type WorkspaceState,
} from "@/lib/workspace";
import { FileUploader } from "@/components/FileUploader";

const FUNNEL_TINT: Record<"calculated" | "hustle", string> = {
  calculated: "bg-mhsp-navy/8 border-mhsp-navy/15",
  hustle: "bg-mhsp-teal/10 border-mhsp-teal/20",
};

const AVATAR_GRADIENT: Record<string, string> = {
  teal: "from-mhsp-teal to-mhsp-navy",
  green: "from-emerald-500 to-mhsp-teal",
  blue: "from-mhsp-teal to-mhsp-navy-soft",
  purple: "from-purple-500 to-mhsp-navy",
  orange: "from-orange-500 to-mhsp-gold",
  amber: "from-amber-400 to-mhsp-gold",
  indigo: "from-indigo-500 to-mhsp-navy",
  pink: "from-pink-400 to-purple-500",
  red: "from-rose-500 to-mhsp-navy",
  emerald: "from-emerald-500 to-mhsp-teal",
  violet: "from-violet-500 to-mhsp-navy",
};

const INIT_MARKER = "__INIT__";
const SCROLL_NEAR_BOTTOM_PX = 80;

export function AgentChat({
  agent,
  hotelProfile,
}: {
  agent: Agent;
  hotelProfile: string | null;
}) {
  const [demoMode] = useDemoMode();
  const [wsSnapshot, setWsSnapshot] = useState<WorkspaceState>(() =>
    typeof window !== "undefined"
      ? getWorkspace()
      : { leads: [], emails: [], files: [], activityLog: [], currentFocus: "", lastUpdated: "" }
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillContent, setSkillContent] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const hasInitRef = useRef(false);

  // Seed demo workspace when demo mode is on
  useEffect(() => {
    if (demoMode) seedDemoWorkspace();
  }, [demoMode]);

  // Keep workspace snapshot fresh
  useEffect(() => {
    function update() { setWsSnapshot(getWorkspace()); }
    window.addEventListener("vhst-workspace-changed", update);
    return () => window.removeEventListener("vhst-workspace-changed", update);
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    setMessages(loadChat(agent.id));
    setHydrated(true);
  }, [agent.id]);

  // Persist on changes
  useEffect(() => {
    if (!hydrated) return;
    saveChat(agent.id, messages);
  }, [messages, agent.id, hydrated]);

  // Auto-scroll if user is near bottom
  function maybeScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottomRef.current) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = remaining < SCROLL_NEAR_BOTTOM_PX;
  }

  useEffect(() => {
    maybeScroll();
  }, [messages.length, streamingMessage]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 144) + "px";
  }, [input]);

  // Click outside menu to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Send a single user message + stream the response.
  const sendMessage = useCallback(
    async (text: string, options?: { isInit?: boolean }) => {
      if (isStreaming) return;
      const isInit = !!options?.isInit;
      const trimmed = isInit ? INIT_MARKER : text.trim();
      if (!trimmed) return;

      // Add the user message to history
      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput("");
      setIsStreaming(true);
      setStreamingMessage("");

      // DEMO MODE: try to load a cached conversation; if missing, fall through.
      if (demoMode) {
        try {
          const res = await fetch(
            `/api/sample-conversation?agentId=${agent.id}`
          );
          if (res.ok) {
            const data = await res.json();
            const cached: ChatMessage[] | undefined = data?.data?.messages;
            if (Array.isArray(cached) && cached.length > 0) {
              // Find the next assistant message to play
              const assistantIdx = nextHistory.filter(
                (m) => m.role === "assistant"
              ).length;
              const cachedAssistants = cached.filter(
                (m: ChatMessage) => m.role === "assistant"
              );
              const next = cachedAssistants[assistantIdx];
              if (next) {
                await playStreamSimulated(next.content);
                finalizeAssistant(next.content);
                return;
              }
            }
          }
        } catch {
          // fall through to live API
        }
      }

      // LIVE: stream from /api/agent-chat
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch("/api/agent-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: agent.id,
            hotelProfile: hotelProfile ?? "",
            teamBriefing: generateTeamBriefing(agent.id),
            messages: nextHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          let err = "Request failed";
          try {
            const j = await res.json();
            err = j.error ?? err;
          } catch {}
          throw new Error(err);
        }
        await consumeSse(res.body, (delta) => {
          setStreamingMessage((prev) => prev + delta);
        });
        // The streaming state already reflects the full content
        setStreamingMessage((current) => {
          finalizeAssistant(current);
          return "";
        });
      } catch (e: unknown) {
        if ((e as { name?: string })?.name !== "AbortError") {
          const msg = e instanceof Error ? e.message : "Something went wrong";
          toast.error(msg);
          finalizeAssistant(`Sorry - I hit an error: ${msg}`);
        } else {
          finalizeAssistant("(stopped)");
        }
      } finally {
        abortRef.current = null;
      }

      function finalizeAssistant(content: string) {
        if (!content || !content.trim()) {
          setIsStreaming(false);
          setStreamingMessage("");
          return;
        }
        const aMsg: ChatMessage = {
          id: newId(),
          role: "assistant",
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aMsg]);
        setIsStreaming(false);
        setStreamingMessage("");
        // Surface in the Notification Center
        addNotification({
          type: "completed",
          title: `${agent.name} finished`,
          description: aMsg.content.replace(/\s+/g, " ").slice(0, 120),
          agentId: agent.id,
          actionUrl: `/agent/${agent.id}`,
        });
        // Log to shared workspace activity
        logWorkspaceActivity(
          agent.id,
          agent.realName,
          `responded in ${agent.jobTitle} chat`
        );
      }

      async function playStreamSimulated(text: string) {
        const words = text.split(/(\s+)/);
        let acc = "";
        for (const w of words) {
          acc += w;
          setStreamingMessage(acc);
          // 30ms per chunk
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 30));
        }
      }
    },
    [agent.id, demoMode, hotelProfile, isStreaming, messages]
  );

  // Trigger initial greeting once after hydration if no history
  useEffect(() => {
    if (!hydrated) return;
    if (hasInitRef.current) return;
    if (messages.length > 0) {
      hasInitRef.current = true;
      return;
    }
    hasInitRef.current = true;
    // Fire init silently
    sendMessage("", { isInit: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) sendMessage(input);
    }
  }

  function handleClear() {
    if (typeof window !== "undefined" && messages.length > 0) {
      const ok = window.confirm("Clear this conversation?");
      if (!ok) return;
    }
    clearChat(agent.id);
    setMessages([]);
    hasInitRef.current = false;
    setMenuOpen(false);
  }

  function handleDownload() {
    const lines: string[] = [];
    lines.push(`# Conversation with ${agent.name}`);
    if (hotelProfile) {
      const firstLine = hotelProfile.split("\n")[0]?.trim();
      const hotelName =
        hotelProfile.match(/Hotel Name\s*:\s*([^\n]+)/i)?.[1]?.trim() ||
        firstLine ||
        "your hotel";
      lines.push(`Hotel: ${hotelName}`);
    }
    lines.push(`Date: ${new Date().toISOString()}`);
    lines.push("");
    for (const m of messages) {
      lines.push(`## ${m.role === "user" ? "You" : agent.name}`);
      lines.push("");
      lines.push(m.content);
      lines.push("");
    }
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${agent.id}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  }

  async function handleViewSkill() {
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/skill?agentId=${agent.id}`);
      const data = await res.json();
      if (data.success && data.content) {
        setSkillContent(data.content);
        setSkillModalOpen(true);
      } else {
        toast.error("Could not load skill");
      }
    } catch {
      toast.error("Could not load skill");
    }
  }

  // Voice integration: append transcript to current input
  const baseInputRef = useRef("");
  const voiceTranscript = useCallback((transcript: string) => {
    setInput(
      baseInputRef.current
        ? baseInputRef.current.replace(/\s*$/, " ") + transcript
        : transcript
    );
  }, []);
  const voiceComplete = useCallback(() => {
    baseInputRef.current = "";
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  function fillFromChip(text: string) {
    setInput(text);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const headerTint =
    FUNNEL_TINT[agent.funnel as "calculated" | "hustle"] ||
    "bg-mhsp-cream-warm/40 border-mhsp-line";
  const avatarGrad = AVATAR_GRADIENT[agent.color] ?? AVATAR_GRADIENT.teal;

  const chips = useMemo(() => quickActionsFor(agent.id), [agent.id]);
  const showWelcome = hydrated && messages.length === 0 && !isStreaming;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[640px] bg-white rounded-2xl border border-mhsp-line overflow-hidden shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
      {/* Header */}
      <header
        className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${headerTint}`}
      >
        <div
          className={`shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-lg shadow-sm`}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-[18px] text-mhsp-navy leading-tight truncate">
            {agent.name}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
            <span className="text-[12px] text-mhsp-muted">Online</span>
            {demoMode && (
              <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-mhsp-success/10 border border-mhsp-success/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mhsp-success">
                Demo
              </span>
            )}
          </div>
        </div>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="p-1.5 rounded-md text-mhsp-muted hover:text-mhsp-navy hover:bg-white/60 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-mhsp-line bg-white shadow-[0_12px_30px_-12px_rgba(11,36,71,0.25)] overflow-hidden z-30">
              <button
                onClick={handleClear}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-mhsp-text hover:bg-mhsp-cream-warm/50 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-mhsp-muted" />
                Clear conversation
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-mhsp-text hover:bg-mhsp-cream-warm/50 transition-colors"
                disabled={messages.length === 0}
              >
                <Download className="h-4 w-4 text-mhsp-muted" />
                Download conversation
              </button>
              <button
                onClick={handleViewSkill}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-mhsp-text hover:bg-mhsp-cream-warm/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-mhsp-muted" />
                View skill
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Workspace panel */}
      <WorkspacePanel ws={wsSnapshot} agentId={agent.id} />

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-mhsp-cream/40"
      >
        {showWelcome && (
          <Welcome
            agent={agent}
            avatarGrad={avatarGrad}
            chips={chips}
            onChip={fillFromChip}
          />
        )}

        {messages
          .filter((m) => !(m.role === "user" && m.content === INIT_MARKER))
          .map((m) =>
            m.role === "user" ? (
              <UserBubble key={m.id} content={m.content} />
            ) : (
              <AssistantBubble
                key={m.id}
                content={m.content}
                avatarGrad={avatarGrad}
                icon={agent.icon}
                agentId={agent.id}
                hotelProfile={hotelProfile ?? undefined}
              />
            )
          )}

        {isStreaming && streamingMessage && (
          <AssistantBubble
            content={streamingMessage}
            streaming
            avatarGrad={avatarGrad}
            icon={agent.icon}
            agentId={agent.id}
            hotelProfile={hotelProfile ?? undefined}
          />
        )}
        {isStreaming && !streamingMessage && (
          <TypingIndicator avatarGrad={avatarGrad} icon={agent.icon} />
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-mhsp-line bg-mhsp-cream/70 px-4 pt-3 pb-4 shrink-0">
        {showWelcome && chips.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => fillFromChip(chip)}
                className="shrink-0 text-[12.5px] font-medium rounded-full border border-mhsp-line bg-white hover:border-mhsp-gold/60 hover:bg-mhsp-gold/5 px-3 py-1.5 text-mhsp-navy whitespace-nowrap transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <FileUploader
            agentId={agent.id}
            agentName={agent.realName}
            disabled={isStreaming}
          />
          <VoiceInput
            onTranscript={voiceTranscript}
            onComplete={voiceComplete}
            disabled={isStreaming}
          />
          <div className="flex-1 flex items-end gap-2 rounded-xl border border-mhsp-line bg-white focus-within:border-mhsp-gold focus-within:ring-2 focus-within:ring-mhsp-gold/20 transition-all px-3 py-2 min-h-[40px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                baseInputRef.current = "";
              }}
              onKeyDown={handleKey}
              onFocus={() => {
                baseInputRef.current = input;
              }}
              onMouseDown={() => {
                baseInputRef.current = input;
              }}
              rows={1}
              placeholder={`Ask ${agent.name} anything... (or use voice)`}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-[14px] leading-relaxed text-mhsp-text placeholder:text-mhsp-muted/70 focus:outline-none max-h-[144px] disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-mhsp-navy hover:bg-mhsp-navy-soft disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
        {isStreaming && (
          <p className="text-[10px] text-mhsp-muted mt-1.5 px-1">
            {agent.name} is responding…
          </p>
        )}
      </div>

      {/* Skill modal */}
      <AnimatePresence>
        {skillModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-mhsp-navy/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSkillModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl border border-mhsp-line shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-mhsp-line">
                <div>
                  <p className="eyebrow">Skill Definition</p>
                  <h3 className="font-display text-lg text-mhsp-navy mt-0.5">
                    {agent.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSkillModalOpen(false)}
                  aria-label="Close"
                  className="p-1.5 rounded-md text-mhsp-muted hover:text-mhsp-navy hover:bg-mhsp-cream-warm/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <pre className="text-xs leading-relaxed font-mono text-mhsp-text whitespace-pre-wrap">
                  {skillContent}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Welcome({
  agent,
  avatarGrad,
  chips,
  onChip,
}: {
  agent: Agent;
  avatarGrad: string;
  chips: string[];
  onChip: (text: string) => void;
}) {
  return (
    <div className="text-center py-10">
      <div
        className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-3xl shadow-md mb-4`}
      >
        {agent.icon}
      </div>
      <h3 className="font-display text-xl text-mhsp-navy">
        Start the conversation
      </h3>
      <p className="text-sm text-mhsp-muted mt-1.5 max-w-md mx-auto">
        Ask {agent.name} anything - or use one of the quick starts below the
        message box.
      </p>
      {chips.length > 0 && (
        <div className="text-[11px] uppercase tracking-[0.16em] text-mhsp-gold font-semibold mt-6">
          Try one of these →
        </div>
      )}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-mhsp-navy text-white px-4 py-2.5 text-[14px] leading-relaxed shadow-[0_2px_8px_-2px_rgba(11,36,71,0.25)] whitespace-pre-wrap">
        {content}
      </div>
    </motion.div>
  );
}

function AssistantBubble({
  content,
  avatarGrad,
  icon,
  streaming = false,
  agentId,
  hotelProfile,
}: {
  content: string;
  avatarGrad: string;
  icon: string;
  streaming?: boolean;
  agentId?: string;
  hotelProfile?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-start gap-2.5"
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-base shadow-sm`}
      >
        {icon}
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-mhsp-line text-mhsp-text px-4 py-3 text-[14px] leading-relaxed shadow-[0_2px_8px_-2px_rgba(11,36,71,0.08)]">
        <div className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:font-display prose-headings:text-mhsp-navy prose-h1:text-base prose-h2:text-base prose-h3:text-sm prose-strong:text-mhsp-navy prose-table:text-[12px] prose-th:bg-mhsp-navy prose-th:text-white prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-mhsp-line prose-th:border prose-th:border-mhsp-navy prose-code:bg-mhsp-cream-warm prose-code:text-mhsp-navy prose-code:rounded prose-code:px-1 prose-code:before:content-[''] prose-code:after:content-['']">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        {streaming && (
          <span className="inline-block w-1 h-3.5 align-middle bg-mhsp-gold animate-pulse rounded-sm ml-0.5" />
        )}
        {!streaming && agentId && (
          <LeadCaptureBar
            content={content}
            agentId={agentId}
            hotelProfile={hotelProfile}
          />
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator({
  avatarGrad,
  icon,
}: {
  avatarGrad: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-base shadow-sm`}
      >
        {icon}
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white border border-mhsp-line px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="block w-1.5 h-1.5 rounded-full bg-mhsp-gold animate-bounce [animation-delay:-0.3s]" />
          <span className="block w-1.5 h-1.5 rounded-full bg-mhsp-gold animate-bounce [animation-delay:-0.15s]" />
          <span className="block w-1.5 h-1.5 rounded-full bg-mhsp-gold animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// ─── Workspace Panel ─────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function WorkspacePanel({
  ws,
  agentId,
}: {
  ws: WorkspaceState;
  agentId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasData =
    ws.leads.length > 0 || ws.emails.length > 0 || ws.files.length > 0;
  if (!hasData) return null;

  const othersActivity = ws.activityLog
    .filter((a) => a.agentId !== agentId)
    .slice(0, 3);

  return (
    <div className="border-b border-mhsp-line bg-[#F4F8FC] shrink-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-[#EBF3FB] transition-colors"
      >
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#0F4C81]">
          <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
          <span>Team workspace:</span>
          {ws.leads.length > 0 && (
            <span className="font-bold">{ws.leads.length} leads</span>
          )}
          {ws.emails.length > 0 && (
            <>
              <span className="text-[#0F4C81]/30">·</span>
              <span className="font-bold">{ws.emails.length} emails</span>
            </>
          )}
          {ws.files.length > 0 && (
            <>
              <span className="text-[#0F4C81]/30">·</span>
              <span className="font-bold">{ws.files.length} files</span>
            </>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#0F4C81]/40 transition-transform ${expanded ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 space-y-1.5 border-t border-[#E5ECF4]">
          {othersActivity.length > 0 ? (
            othersActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-baseline gap-1.5 text-[12px] text-mhsp-muted"
              >
                <span className="font-semibold text-[#0F4C81] shrink-0">
                  {a.agentName}:
                </span>
                <span className="flex-1 truncate">{a.action}</span>
                <span className="shrink-0 text-[11px]">
                  {relTime(a.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[12px] text-mhsp-muted">No teammate activity yet.</p>
          )}
          {ws.leads.length > 0 && (
            <div className="text-[12px] text-mhsp-muted pt-0.5">
              <span className="font-semibold text-[#0F4C81]">Top leads: </span>
              {ws.leads
                .slice(0, 3)
                .map((l) => l.name)
                .join(", ")}
              {ws.leads.length > 3 && (
                <span> +{ws.leads.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Parse SSE stream of `data: {json}\n\n` events.
async function consumeSse(
  body: ReadableStream<Uint8Array>,
  onText: (delta: string) => void
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const dataLines = chunk
        .split("\n")
        .filter((l) => l.startsWith("data: "))
        .map((l) => l.slice(6));
      for (const line of dataLines) {
        try {
          const evt = JSON.parse(line);
          if (evt.type === "text" && typeof evt.text === "string") {
            onText(evt.text);
          } else if (evt.type === "done") {
            return;
          } else if (evt.type === "error") {
            throw new Error(evt.error || "stream error");
          }
        } catch (err) {
          if (err instanceof Error && err.message !== "stream error") {
            // probably a malformed/partial chunk - ignore
            continue;
          }
          throw err;
        }
      }
    }
  }
}
