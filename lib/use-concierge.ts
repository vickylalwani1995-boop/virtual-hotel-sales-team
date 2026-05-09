"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PageContext } from "@/lib/concierge-system-prompt";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const HISTORY_KEY = "vhst-concierge-history";
const OPEN_KEY = "vhst-concierge-open";
const MAX_HISTORY = 20;

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = history.slice(-MAX_HISTORY);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or blocked — non-fatal
  }
}

export function useConcierge() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    if (typeof window !== "undefined") {
      setOpen(window.localStorage.getItem(OPEN_KEY) === "1");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window !== "undefined") {
      if (open) window.localStorage.setItem(OPEN_KEY, "1");
      else window.localStorage.removeItem(OPEN_KEY);
    }
  }, [open, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveHistory(history);
  }, [history, hydrated]);

  const send = useCallback(
    async (text: string, pageContext: PageContext) => {
      const userMsg: ChatMessage = {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };
      const next = [...history, userMsg];
      setHistory(next);
      setStreaming(true);
      setStreamingContent("");

      const ac = new AbortController();
      abortRef.current = ac;
      let acc = "";
      try {
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map((m) => ({ role: m.role, content: m.content })),
            pageContext,
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
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setStreamingContent(acc);
        }
      } catch (e: unknown) {
        if ((e as { name?: string })?.name !== "AbortError") {
          const msg = e instanceof Error ? e.message : "Something went wrong";
          acc = acc || `Sorry — I hit an error: ${msg}`;
        }
      } finally {
        const assistantMsg: ChatMessage = {
          id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          role: "assistant",
          content: acc.trim() || "(no response)",
          timestamp: new Date().toISOString(),
        };
        setHistory((prev) => [...prev, assistantMsg]);
        setStreaming(false);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [history]
  );

  const clear = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    history,
    open,
    setOpen,
    send,
    clear,
    streaming,
    streamingContent,
    cancelStream,
    hydrated,
  };
}
