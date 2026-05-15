import { nanoid } from "nanoid"
import { AGENT_SLUGS } from "./tasks"

export interface ChatMessage {
  id: string
  channelId: string
  authorType: "user" | "agent" | "system"
  authorId: string
  authorName: string
  body: string
  timestamp: string
  mentions: string[]
  reactions: Record<string, string[]>
  parentMessageId?: string
  taskId?: string
}

const CHAT_KEY = "vhst-chat-messages"

export function loadMessages(channelId = "sales-team"): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    const all: ChatMessage[] = raw ? JSON.parse(raw) : []
    return all.filter((m) => m.channelId === channelId)
  } catch {
    return []
  }
}

export function saveMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages))
}

export function postMessage(message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage {
  const msg: ChatMessage = {
    ...message,
    id: nanoid(),
    timestamp: new Date().toISOString(),
  }
  const all = getAllMessages()
  saveMessages([...all, msg])
  return msg
}

function getAllMessages(): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function parseMentions(body: string): string[] {
  const matches = body.match(/@(\w+)/g) ?? []
  const resolved: string[] = []
  for (const m of matches) {
    const slug = m.slice(1).toLowerCase()
    if (slug === "everyone") {
      resolved.push(...Object.values(AGENT_SLUGS).filter((v, i, a) => a.indexOf(v) === i))
      break
    }
    const agentId = AGENT_SLUGS[slug]
    if (agentId && !resolved.includes(agentId)) resolved.push(agentId)
  }
  return resolved
}

export function addReaction(messageId: string, emoji: string, userId: string): ChatMessage[] {
  const all = getAllMessages()
  const updated = all.map((m) => {
    if (m.id !== messageId) return m
    const users = m.reactions[emoji] ?? []
    const toggled = users.includes(userId)
      ? users.filter((u) => u !== userId)
      : [...users, userId]
    return { ...m, reactions: { ...m.reactions, [emoji]: toggled } }
  })
  saveMessages(updated)
  return updated
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

export const MENTION_AGENTS = [
  { slug: "donna",    id: "01_director",  name: "Donna Marie",  role: "Director of Sales" },
  { slug: "marcus",   id: "02_lead_gen",  name: "Marcus Reed",  role: "Lead Generation" },
  { slug: "sarah",    id: "03_outbound",  name: "Sarah Chen",   role: "Outbound Sales" },
  { slug: "priya",    id: "04_rfp_group", name: "Priya Sharma", role: "Group & RFP" },
  { slug: "liam",     id: "05_retention", name: "Liam Chen",    role: "Customer Success" },
  { slug: "maya",     id: "06_revenue",   name: "Maya Reddy",   role: "Revenue Analytics" },
  { slug: "everyone", id: "everyone",     name: "Everyone",     role: "All agents" },
  { slug: "captain",  id: "01_director",  name: "Captain",      role: "Alias for Donna" },
]
