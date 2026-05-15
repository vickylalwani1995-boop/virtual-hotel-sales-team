"use client"

import { useState } from "react"
import { formatTime, type ChatMessage as ChatMsg, addReaction } from "@/lib/team-chat"
import { AGENT_COLORS, AGENT_ROLES } from "@/lib/tasks"

const REACTION_EMOJIS = ["👍", "❤️", "🎯", "✅"]

interface ChatMessageProps {
  message: ChatMsg
  isUser: boolean
  onReact: (messageId: string, emoji: string) => void
}

export function ChatMessageItem({ message, isUser, onReact }: ChatMessageProps) {
  const [showReactions, setShowReactions] = useState(false)

  const color = AGENT_COLORS[message.authorId] ?? "#0F4C81"
  const initials = message.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2)
  const role = AGENT_ROLES[message.authorId]

  const hasReactions = Object.entries(message.reactions).some(([, users]) => users.length > 0)

  const ts = message.timestamp.startsWith("SEED_")
    ? message.timestamp.replace("SEED_TODAY_", "").replace("SEED_FRIDAY_", "Fri ")
    : formatTime(message.timestamp)

  if (message.authorType === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] italic text-[#9CA3AF] bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#E2E8F0]">
          {message.body}
        </span>
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 group mb-1">
        <div className="max-w-[72%]">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-[11px] text-[#9CA3AF]">{ts}</span>
            <span className="text-xs font-semibold text-[#5A6B82]">You</span>
          </div>
          <div className="bg-[#0F4C81] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
            {renderBody(message.body)}
          </div>
          {hasReactions && <ReactionBar reactions={message.reactions} messageId={message.id} onReact={onReact} />}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex gap-3 group mb-1"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[#0F1B2D]">{message.authorName}</span>
          {role && <span className="text-[11px] text-[#9CA3AF]">{role}</span>}
          <span className="text-[11px] text-[#9CA3AF]">{ts}</span>
          {showReactions && (
            <div className="flex gap-0.5 ml-2">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className="text-sm hover:scale-125 transition-transform opacity-60 hover:opacity-100"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[#1E2D3D] leading-relaxed border-l-4 shadow-sm whitespace-pre-wrap"
          style={{ borderLeftColor: color + "80" }}
        >
          {renderBody(message.body)}
        </div>
        {hasReactions && <ReactionBar reactions={message.reactions} messageId={message.id} onReact={onReact} />}
      </div>
    </div>
  )
}

function ReactionBar({
  reactions,
  messageId,
  onReact,
}: {
  reactions: Record<string, string[]>
  messageId: string
  onReact: (id: string, emoji: string) => void
}) {
  return (
    <div className="flex gap-1 mt-1 flex-wrap">
      {Object.entries(reactions)
        .filter(([, users]) => users.length > 0)
        .map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => onReact(messageId, emoji)}
            className="inline-flex items-center gap-1 text-xs bg-[#EAF2FA] border border-[#C9DAEB] rounded-full px-2 py-0.5 hover:bg-[#D6E8F7] transition-colors"
          >
            {emoji} <span className="text-[#0F4C81] font-semibold">{users.length}</span>
          </button>
        ))}
    </div>
  )
}

function renderBody(body: string) {
  const parts = body.split(/(@\w+)/g)
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="bg-[#D4A537]/20 text-[#B8922E] font-semibold px-0.5 rounded">
          {part}
        </span>
      )
    }
    return part
  })
}
