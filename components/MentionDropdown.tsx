"use client"

import { MENTION_AGENTS, type ChatMessage as ChatMsg } from "@/lib/team-chat"
import { AGENT_COLORS } from "@/lib/tasks"

interface MentionDropdownProps {
  query: string
  onSelect: (slug: string) => void
}

export function MentionDropdown({ query, onSelect }: MentionDropdownProps) {
  const filtered = MENTION_AGENTS.filter(
    (a) =>
      a.slug.startsWith(query.toLowerCase()) ||
      a.name.toLowerCase().startsWith(query.toLowerCase()),
  )

  if (filtered.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-30 overflow-hidden">
      <div className="px-3 py-2 border-b border-[#F1F5F9]">
        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Mention a teammate</p>
      </div>
      {filtered.map((agent) => {
        const color = AGENT_COLORS[agent.id] ?? "#0F4C81"
        return (
          <button
            key={agent.slug}
            onMouseDown={(e) => { e.preventDefault(); onSelect(agent.slug) }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F4F8FC] transition-colors text-left"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: color }}
            >
              {agent.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F1B2D] truncate">@{agent.slug}</p>
              <p className="text-[11px] text-[#5A6B82] truncate">{agent.name} · {agent.role}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
