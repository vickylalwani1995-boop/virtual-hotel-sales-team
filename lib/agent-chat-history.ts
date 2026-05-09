"use client";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const MAX_MESSAGES = 20;
const KEY_PREFIX = "vhst-chat-";

function key(agentId: string) {
  return `${KEY_PREFIX}${agentId}`;
}

export function loadChat(agentId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(agentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.messages)) return parsed.messages;
    return [];
  } catch {
    return [];
  }
}

export function saveChat(agentId: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.slice(-MAX_MESSAGES);
    window.localStorage.setItem(
      key(agentId),
      JSON.stringify({
        messages: trimmed,
        lastUpdated: new Date().toISOString(),
      })
    );
  } catch {
    // ignore quota / storage errors
  }
}

export function clearChat(agentId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(agentId));
}

export function newId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
