"use client"

import { useState } from "react"
import { formatTime, type ChatMessage as ChatMsg } from "@/lib/team-chat"
import { AGENT_COLORS, AGENT_ROLES } from "@/lib/tasks"

const REACTION_EMOJIS = ["👍", "❤️", "🎯", "✅"]

interface ChatMessageProps {
  message: ChatMsg
  isUser: boolean
  onReact: (messageId: string, emoji: string) => void
}

function resolveTime(ts: string): string {
  if (ts.startsWith("SEED_TODAY_")) return ts.replace("SEED_TODAY_", "")
  if (ts.startsWith("SEED_")) return ts.replace(/SEED_\w+_/, "")
  try { return formatTime(ts) } catch { return ts }
}

function renderBody(body: string) {
  return body.split(/(@\w+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-semibold text-[#D4A537] bg-[#D4A537]/10 rounded px-0.5">
        {part}
      </span>
    ) : part
  )
}

function ReactionBar({ reactions, messageId, onReact }: { reactions: Record<string, string[]>; messageId: string; onReact: (id: string, e: string) => void }) {
  const active = Object.entries(reactions).filter(([, u]) => u.length > 0)
  if (!active.length) return null
  return (
    <div className="flex gap-1.5 mt-1.5 flex-wrap">
      {active.map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => onReact(messageId, emoji)}
          className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-[#DCE5EF] hover:border-[#1B6EB7] hover:bg-[#EAF2FA] rounded-full px-2.5 py-0.5 transition-all shadow-sm"
        >
          {emoji} <span className="text-[#0F4C81]">{users.length}</span>
        </button>
      ))}
    </div>
  )
}

export function ChatMessageItem({ message, isUser, onReact }: ChatMessageProps) {
  const [hovered, setHovered] = useState(false)
  const color = AGENT_COLORS[message.authorId] ?? "#0F4C81"
  const initials = message.authorName.split(" ").map(n => n[0]).join("").slice(0, 2)
  const role = AGENT_ROLES[message.authorId]
  const ts = resolveTime(message.timestamp)

  if (message.authorType === "system") {
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-[#E5ECF4]" />
        <span className="text-[11px] font-semibold text-[#94A3B8] tracking-wide uppercase shrink-0 px-1">
          {message.body}
        </span>
        <div className="flex-1 h-px bg-[#E5ECF4]" />
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group">
        <div className="max-w-[68%] sm:max-w-[56%]">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-[11px] text-[#94A3B8] font-numeric">{ts}</span>
            <span className="text-xs font-bold text-[#0F4C81]">You</span>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-[0_4px_16px_-4px_rgba(15,76,129,0.35)] whitespace-pre-wrap">
              {renderBody(message.body)}
            </div>
          </div>
          <div className="flex justify-end mt-1">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {REACTION_EMOJIS.map(e => (
                <button key={e} onMouseDown={() => onReact(message.id, e)} className="text-sm hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <ReactionBar reactions={message.reactions} messageId={message.id} onReact={onReact} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex gap-3 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div className="shrink-0 relative mt-0.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)]"
          style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
        >
          {initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0 max-w-[72%]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-bold text-[#0F1B2D]">{message.authorName}</span>
          {role && <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">{role}</span>}
          <span className="text-[11px] text-[#94A3B8] font-numeric ml-auto">{ts}</span>
        </div>
        <div
          className="relative bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[#1E293B] leading-relaxed border border-[#E5ECF4] shadow-[0_2px_8px_-4px_rgba(15,76,129,0.08)] whitespace-pre-wrap"
          style={{ borderLeftColor: color + "60", borderLeftWidth: "3px" }}
        >
          {renderBody(message.body)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <ReactionBar reactions={message.reactions} messageId={message.id} onReact={onReact} />
          {hovered && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {REACTION_EMOJIS.map(e => (
                <button key={e} onMouseDown={() => onReact(message.id, e)} className="text-sm hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
