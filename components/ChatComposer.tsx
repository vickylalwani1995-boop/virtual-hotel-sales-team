"use client"

import { useRef, useState } from "react"
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
  const ref = useRef<HTMLTextAreaElement>(null)

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
    if (ref.current) {
      ref.current.style.height = "auto"
      ref.current.style.height = Math.min(ref.current.scrollHeight, 104) + "px"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() }
    if (e.key === "Escape") setMentionQuery(null)
  }

  function handleMentionSelect(slug: string) {
    if (mentionStart === -1) return
    const cursorPos = ref.current?.selectionStart ?? body.length
    const before = body.slice(0, mentionStart)
    const after = body.slice(cursorPos)
    const newBody = `${before}@${slug} ${after}`
    const newPos = before.length + slug.length + 2
    setBody(newBody)
    setMentionQuery(null)
    setMentionStart(-1)
    setTimeout(() => {
      if (ref.current) {
        ref.current.setSelectionRange(newPos, newPos)
        ref.current.focus()
        ref.current.style.height = "auto"
        ref.current.style.height = Math.min(ref.current.scrollHeight, 104) + "px"
      }
    }, 0)
  }

  function submit() {
    const t = body.trim()
    if (!t || disabled) return
    onSend(t)
    setBody("")
    setMentionQuery(null)
    if (ref.current) ref.current.style.height = "auto"
  }

  return (
    <div className="bg-white border-t border-[#E5ECF4] px-4 sm:px-6 py-4">
      <div className="relative">
        {mentionQuery !== null && (
          <MentionDropdown query={mentionQuery} onSelect={handleMentionSelect} />
        )}
        <div className="flex gap-3 items-end bg-[#F8FAFC] border border-[#DCE5EF] rounded-2xl px-4 py-3 focus-within:border-[#1B6EB7] focus-within:ring-2 focus-within:ring-[#1B6EB7]/15 focus-within:bg-white transition-all shadow-sm">
          <textarea
            ref={ref}
            value={body}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Message the team… (Enter to send · Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#0F1B2D] placeholder:text-[#94A3B8] resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: 104 }}
          />
          <button
            onClick={submit}
            disabled={!body.trim() || disabled}
            className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A537] to-[#B8922E] text-white flex items-center justify-center transition-all hover:shadow-[0_4px_12px_-2px_rgba(212,165,55,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_2px_8px_-2px_rgba(212,165,55,0.4)]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-0.5 px-1">
        <p className="text-[11px] text-[#94A3B8]">Tag @donna to route · @marcus @sarah @priya @liam @maya directly · @everyone for all</p>
        <p className="text-[11px] text-[#94A3B8]">/task · /standup · /status · /brief · /help</p>
      </div>
    </div>
  )
}
