"use client"

import { useRef, useState, useEffect } from "react"
import { Send } from "lucide-react"
import { MentionDropdown } from "@/components/MentionDropdown"

interface ChatComposerProps {
  onSend: (body: string) => void
  disabled?: boolean
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [body, setBody] = useState("")
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setBody(val)

    const cursor = e.target.selectionStart ?? val.length
    const before = val.slice(0, cursor)
    const atMatch = before.match(/@(\w*)$/)
    if (atMatch) {
      setMentionQuery(atMatch[1])
      setMentionStart(cursor - atMatch[0].length)
    } else {
      setMentionQuery(null)
      setMentionStart(-1)
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + "px"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
    if (e.key === "Escape") {
      setMentionQuery(null)
    }
  }

  function handleMentionSelect(slug: string) {
    if (mentionStart === -1) return
    const before = body.slice(0, mentionStart)
    const after = body.slice(textareaRef.current?.selectionStart ?? body.length)
    const newBody = `${before}@${slug} ${after}`
    setBody(newBody)
    setMentionQuery(null)
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + slug.length + 2
        textareaRef.current.setSelectionRange(pos, pos)
        textareaRef.current.focus()
      }
    }, 0)
  }

  function submit() {
    const trimmed = body.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setBody("")
    setMentionQuery(null)
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  return (
    <div className="border-t border-[#E2E8F0] bg-white px-4 py-3">
      <div className="relative">
        {mentionQuery !== null && (
          <MentionDropdown query={mentionQuery} onSelect={handleMentionSelect} />
        )}
        <div className="flex gap-2 items-end bg-[#F8FAFC] border border-[#DCE5EF] rounded-xl px-3 py-2.5 focus-within:border-[#1B6EB7] focus-within:ring-2 focus-within:ring-[#1B6EB7]/20 transition">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Message the team... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#0F1B2D] placeholder:text-[#9CA3AF] resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: 96 }}
          />
          <button
            onClick={submit}
            disabled={!body.trim() || disabled}
            className="shrink-0 w-8 h-8 rounded-lg bg-[#D4A537] hover:bg-[#B8922E] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <p className="text-[11px] text-[#9CA3AF]">Tag @donna for routing, or @marcus / @sarah / @priya / @liam / @maya directly</p>
        <p className="text-[11px] text-[#9CA3AF]">Use /task · /status · /brief · /standup · /help</p>
      </div>
    </div>
  )
}
