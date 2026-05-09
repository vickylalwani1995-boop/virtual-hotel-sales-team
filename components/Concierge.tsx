"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ConciergeBell, X, Trash2, Sparkles } from "lucide-react";
import { useConcierge } from "@/lib/use-concierge";
import { useDemoMode } from "@/lib/demo-mode";
import { getAgent } from "@/lib/agents";
import {
  AssistantMessage,
  TypingIndicator,
  UserMessage,
} from "@/components/ConciergeMessage";
import { ConciergeInput } from "@/components/ConciergeInput";
import type { PageContext } from "@/lib/concierge-system-prompt";

const QUICK_CHIPS = [
  "How do I use this app?",
  "What's the best agent for cold outreach?",
  "Help me write a proposal email",
  "Explain RevPAR vs ADR",
  "Why is my hotel weak on weekdays?",
];

function contextHint(ctx: PageContext): string {
  const route = ctx.route ?? "";
  if (route === "/") return "I see you're entering a hotel profile. Need help describing your property?";
  if (route.startsWith("/agents"))
    return "I see your sales team is ready. Want me to suggest where to start?";
  if (route.startsWith("/agent/") && ctx.agentName)
    return `I see you're looking at the ${ctx.agentName}. I can explain what it does or help interpret its output.`;
  if (route.startsWith("/activity"))
    return "I see your activity log. Want me to summarize?";
  return "";
}

export function Concierge() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [demoMode] = useDemoMode();
  const {
    history,
    open,
    setOpen,
    send,
    clear,
    streaming,
    streamingContent,
    cancelStream,
    hydrated,
  } = useConcierge();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build page context dynamically
  const pageContext = useMemo<PageContext>(() => {
    const ctx: PageContext = { route: pathname, demoMode };
    const profile = searchParams?.get("profile") ?? "";
    if (profile) ctx.hotelProfile = profile;
    const agentMatch = pathname.match(/^\/agent\/([^/?]+)/);
    if (agentMatch) {
      const agent = getAgent(agentMatch[1]);
      if (agent) {
        ctx.agentId = agent.id;
        ctx.agentName = agent.name;
      }
    }
    return ctx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, demoMode]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Autoscroll on new content
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history.length, streamingContent, open]);

  function handleSend(text: string) {
    send(text, pageContext);
  }

  function handleClear() {
    if (typeof window !== "undefined" && history.length > 0) {
      const ok = window.confirm("Clear this conversation?");
      if (!ok) return;
    }
    clear();
  }

  const empty = history.length === 0 && !streaming;
  const hint = contextHint(pageContext);

  return (
    <>
      {/* Floating button */}
      {hydrated && !open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => setOpen(true)}
          aria-label="Open myConcierge chat (Ctrl+K)"
          className="fixed bottom-6 right-6 z-50 group"
        >
          <span className="absolute inset-0 rounded-full bg-mhsp-gold/40 animate-ping" style={{ animationDuration: "5s" }} />
          <span className="relative flex items-center justify-center w-[60px] h-[60px] rounded-full bg-mhsp-gold text-white shadow-[0_8px_24px_-6px_rgba(27,110,183,0.6)] hover:shadow-[0_12px_32px_-6px_rgba(27,110,183,0.7)] hover:scale-105 transition-all">
            <ConciergeBell className="h-6 w-6" />
          </span>
          <span className="absolute right-[72px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-mhsp-navy text-white text-sm font-medium px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            myConcierge · Ctrl+K
          </span>
        </motion.button>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-mhsp-navy/30 backdrop-blur-sm md:hidden"
            />
            {/* Panel */}
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              role="dialog"
              aria-label="myConcierge chat"
              className="fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-mhsp-cream border-l border-mhsp-line shadow-[0_0_60px_-10px_rgba(15,76,129,0.35)] flex flex-col"
            >
              {/* Header */}
              <header className="bg-mhsp-navy text-white px-5 py-4 flex items-center gap-3 shrink-0">
                <div className="shrink-0 w-10 h-10 rounded-full bg-mhsp-gold flex items-center justify-center shadow-md">
                  <ConciergeBell className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg leading-tight">
                      myConcierge
                    </h2>
                    {demoMode && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mhsp-success/20 border border-mhsp-success/40 px-1.5 py-0.5 text-[14px] font-bold uppercase tracking-wider text-mhsp-success">
                        <span className="h-1 w-1 rounded-full bg-mhsp-success" />
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-white/70">
                    Your hotel sales co-pilot
                  </p>
                </div>
                <button
                  onClick={handleClear}
                  className="text-white/60 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Clear conversation"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Messages area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-mhsp-cream"
              >
                {empty ? (
                  <Welcome
                    hint={hint}
                    onChip={(text) => handleSend(text)}
                  />
                ) : (
                  <>
                    {history.map((m) =>
                      m.role === "user" ? (
                        <UserMessage key={m.id} content={m.content} />
                      ) : (
                        <AssistantMessage key={m.id} content={m.content} />
                      )
                    )}
                    {streaming && streamingContent && (
                      <AssistantMessage content={streamingContent} streaming />
                    )}
                    {streaming && !streamingContent && <TypingIndicator />}
                  </>
                )}
              </div>

              {/* Input */}
              <ConciergeInput
                onSend={handleSend}
                disabled={streaming}
                streaming={streaming}
                onCancel={cancelStream}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Welcome({
  hint,
  onChip,
}: {
  hint: string;
  onChip: (text: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl rounded-tl-sm border border-mhsp-line p-5 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-mhsp-gold flex items-center justify-center shrink-0">
            <ConciergeBell className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-sm font-semibold text-mhsp-navy">
            myConcierge
          </span>
        </div>
        <p className="text-[14px] text-mhsp-text leading-relaxed">
          Hi! I&apos;m <strong className="text-mhsp-navy">myConcierge</strong>,
          your AI hotel sales assistant. I can help you with:
        </p>
        <ul className="mt-2.5 space-y-1.5 text-[14px] text-mhsp-text">
          <li className="flex gap-2">
            <span className="text-mhsp-gold">•</span>
            Explaining how this app works
          </li>
          <li className="flex gap-2">
            <span className="text-mhsp-gold">•</span>
            Hotel sales strategy and best practices
          </li>
          <li className="flex gap-2">
            <span className="text-mhsp-gold">•</span>
            Writing emails, proposals, and follow-ups
          </li>
          <li className="flex gap-2">
            <span className="text-mhsp-gold">•</span>
            Suggesting which agent to run for your situation
          </li>
          <li className="flex gap-2">
            <span className="text-mhsp-gold">•</span>
            Hotel industry questions (RFPs, LNRs, RevPAR, etc.)
          </li>
          <li className="flex gap-2">
            <span className="text-mhsp-gold">•</span>
            Reviewing or improving the outputs you get
          </li>
        </ul>
        <p className="mt-3 text-[14px] text-mhsp-navy font-medium">
          What can I help you with?
        </p>
      </div>

      {hint && (
        <div className="rounded-2xl border border-mhsp-gold/40 bg-mhsp-gold/10 px-4 py-3 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-mhsp-gold shrink-0 mt-0.5" />
          <p className="text-[14px] text-mhsp-navy leading-relaxed">{hint}</p>
        </div>
      )}

      <div>
        <p className="eyebrow mb-2.5">Quick starts</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onChip(chip)}
              className="text-left text-[14px] rounded-full border border-mhsp-line bg-white hover:border-mhsp-gold/60 hover:bg-mhsp-gold/5 px-3 py-1.5 text-mhsp-navy font-medium transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
