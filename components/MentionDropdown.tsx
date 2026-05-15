"use client"

import { MENTION_AGENTS } from "@/lib/team-chat"
import { AGENT_COLORS } from "@/lib/tasks"

interface MentionDropdownProps {
  query: string
  onSelect: (slug: string) => void
}

export function MentionDropdown({ query, onSelect }: MentionDropdownProps) {
  const filtered = MENTION_AGENTS.filter(
    a => a.slug.startsWith(query.toLowerCase()) || a.name.toLowerCase().startsWith(query.toLowerCase())
  )
  if (!filtered.length) return null

  return (
    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-[#E5ECF4] rounded-2xl shadow-[0_16px_48px_-12px_rgba(15,76,129,0.22)] z-50 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#F1F5F9] bg-gradient-to-r from-[#F8FAFC] to-white">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Mention a teammate</p>
      </div>
      {filtered.map(agent => {
        const color = AGENT_COLORS[agent.id] ?? "#0F4C81"
        return (
          <button
            key={agent.slug}
            onMouseDown={e => { e.preventDefault(); onSelect(agent.slug) }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4F8FC] transition-colors text-left group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
              style={{ background: `linear-gradient(135deg, ${color}bb, ${color})` }}
            >
              {agent.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0F1B2D] group-hover:text-[#0F4C81] transition-colors">
                @{agent.slug}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">{agent.name} · {agent.role}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
