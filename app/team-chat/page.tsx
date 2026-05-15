"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Hash, Users, Zap, BarChart2, ClipboardList, ChevronRight, MessageSquare, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChatMessageItem } from "@/components/ChatMessage"
import { ChatComposer } from "@/components/ChatComposer"
import {
  type ChatMessage, loadMessages, saveMessages, postMessage,
  parseMentions, addReaction, formatTime, MENTION_AGENTS,
} from "@/lib/team-chat"
import {
  AGENT_COLORS, AGENT_NAMES, AGENT_ROLES, AGENT_SLUGS,
  createTask, loadTasks, saveTasks, type Task,
} from "@/lib/tasks"
import seedData from "@/sample-data/team-chat-seed.json"

const CHANNEL = "sales-team"
const USER_ID  = "user"

const QUICK_REPLIES: Record<string, string[]> = {
  "01_director":  ["On it. Routing to the right specialist now.", "Good call. I'll brief the team and confirm by EOD.", "Noted. Let me coordinate across the board."],
  "02_lead_gen":  ["Starting now. Leads incoming in 30 min.", "On it. Apollo search running — uploading to Lead Manager.", "Got it. I'll pull and enrich the list. ETA end of day."],
  "03_outbound":  ["On it. Drafting the sequence now, first touch goes out today.", "Got them. Running sentiment qual — hot leads first.", "Drafting 3 variants now. Ready for review in 20 min."],
  "04_rfp_group": ["Working on it. Draft proposal ready for review shortly.", "On it. Checking availability and pricing the block now.", "Draft ready. @donna can you review before I send?"],
  "05_retention": ["On it. Scheduling post-stay calls now.", "Already on it. Win-back sequence ready to go.", "Got it. Pulling guest list and starting review request sequence."],
  "06_revenue":   ["Numbers updated. Running analysis now.", "Pulling pickup data. Breakdown ready within the hour.", "On it. Comp set check running — flagging any rate opportunities."],
}

const STANDUP_LINES: Record<string, string> = {
  "01_director":  "Pipeline review and RFP approval for Priya's Texas Restaurant Association proposal.",
  "02_lead_gen":  "Enriching 25 Dallas medical leads. Handing top 10 to Sarah by noon.",
  "03_outbound":  "Sequencing 8 hot leads from Marcus. First email goes out at 2 PM.",
  "04_rfp_group": "Finalizing Texas Restaurant Association RFP. Waiting on Donna's approval.",
  "05_retention": "Post-stay calls done. Running review request sequence for 12 recent guests.",
  "06_revenue":   "Pickup +14% WoW. Sun-Tue gap closing. Owner brief at 5.",
}

function resolveSeededMessages(messages: ChatMessage[]): ChatMessage[] {
  const now = new Date()
  return messages.map(m => {
    if (!m.timestamp.startsWith("SEED_")) return m
    const timeStr = m.timestamp.replace("SEED_TODAY_", "").replace("SEED_", "")
    const [h, min] = timeStr.split(":").map(Number)
    const d = new Date(now); d.setHours(h, min, 0, 0)
    return { ...m, timestamp: d.toISOString() }
  })
}

function resolveSeededTasks(tasks: Task[]): Task[] {
  const now = new Date()
  function r(ts: string): string {
    if (!ts.startsWith("SEED_")) return ts
    const timeStr = ts.replace("SEED_TODAY_", "").replace("SEED_FRIDAY_", "").replace("SEED_", "")
    const [h, min] = timeStr.split(":").map(Number)
    const d = new Date(now)
    if (ts.includes("FRIDAY")) d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7))
    d.setHours(h, min, 0, 0)
    return d.toISOString()
  }
  return tasks.map(t => ({
    ...t,
    createdAt: r(t.createdAt),
    dueDate: t.dueDate ? r(t.dueDate) : undefined,
    completedAt: t.completedAt ? r(t.completedAt) : undefined,
    activityLog: t.activityLog.map(a => ({ ...a, timestamp: r(a.timestamp) })),
  }))
}

export default function TeamChatPage() {
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [tasks,       setTasks]       = useState<Task[]>([])
  const [typing,      setTyping]      = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = loadMessages(CHANNEL)
    if (stored.length > 0) {
      setMessages(stored)
    } else {
      const seeded = resolveSeededMessages(seedData.messages as unknown as ChatMessage[])
      saveMessages(seeded)
      setMessages(seeded)
    }
    const storedTasks = loadTasks()
    if (storedTasks.length > 0) {
      setTasks(storedTasks)
    } else {
      const seededTasks = resolveSeededTasks(seedData.tasks as Task[])
      saveTasks(seededTasks)
      setTasks(seededTasks)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  const agentReply = useCallback(async (agentId: string, trigger: ChatMessage) => {
    setTyping(AGENT_NAMES[agentId])
    const delay = 1400 + Math.random() * 900
    try {
      const history = loadMessages(CHANNEL).slice(-8).map(m => ({
        role: m.authorType === "user" ? "user" : "assistant",
        content: `${m.authorName}: ${m.body}`,
      }))
      const resp = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          messages: [
            ...history,
            { role: "user", content: `[Team Chat — 2-3 sentences max, conversational, no markdown headers]\n${trigger.body}` },
          ],
          teamBriefing: "",
        }),
      })
      if (!resp.ok || !resp.body) throw new Error("stream failed")
      const reader = resp.body.getReader()
      const dec = new TextDecoder()
      let text = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of dec.decode(value).split("\n")) {
          if (!line.trim().startsWith("data:")) continue
          try {
            const evt = JSON.parse(line.slice(5))
            if (evt.type === "text") text += evt.text
          } catch { /**/ }
        }
      }
      setTimeout(() => {
        setTyping(null)
        postMessage({ channelId: CHANNEL, authorType: "agent", authorId: agentId, authorName: AGENT_NAMES[agentId], body: text.trim() || (QUICK_REPLIES[agentId]?.[0] ?? "On it."), mentions: [], reactions: {} })
        setMessages(loadMessages(CHANNEL))
      }, delay)
    } catch {
      const r = QUICK_REPLIES[agentId]
      const pick = r?.[Math.floor(Math.random() * r.length)] ?? "On it."
      setTimeout(() => {
        setTyping(null)
        postMessage({ channelId: CHANNEL, authorType: "agent", authorId: agentId, authorName: AGENT_NAMES[agentId], body: pick, mentions: [], reactions: {} })
        setMessages(loadMessages(CHANNEL))
      }, delay)
    }
  }, [])

  async function handleSend(body: string) {
    const lower = body.trim().toLowerCase()

    // /help
    if (lower === "/help") {
      postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setTimeout(() => {
        postMessage({ channelId: CHANNEL, authorType: "system", authorId: "system", authorName: "System", body: "Commands: /task @agent description · /standup · /status · /brief · /help", mentions: [], reactions: {} })
        setMessages(loadMessages(CHANNEL))
      }, 400)
      setMessages(loadMessages(CHANNEL))
      return
    }

    // /standup
    if (lower === "/standup") {
      postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setMessages(loadMessages(CHANNEL))
      Object.keys(STANDUP_LINES).forEach((id, i) => {
        setTimeout(() => {
          postMessage({ channelId: CHANNEL, authorType: "agent", authorId: id, authorName: AGENT_NAMES[id], body: STANDUP_LINES[id] ?? "Working on assigned tasks.", mentions: [], reactions: {} })
          setMessages(loadMessages(CHANNEL))
        }, (i + 1) * 750)
      })
      return
    }

    // /status
    if (lower === "/status") {
      const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setMessages(loadMessages(CHANNEL))
      setTimeout(() => agentReply("01_director", userMsg), 300)
      return
    }

    // /brief
    if (lower === "/brief") {
      const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setMessages(loadMessages(CHANNEL))
      setTimeout(() => agentReply("06_revenue", userMsg), 300)
      return
    }

    // /task @agent description
    const taskMatch = body.match(/^\/task\s+@(\w+)\s+(.+)/i)
    if (taskMatch) {
      const [, slug, title] = taskMatch
      const agentId = AGENT_SLUGS[slug.toLowerCase()]
      if (agentId) {
        const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [agentId], reactions: {} })
        setMessages(loadMessages(CHANNEL))
        const newTask = createTask({ title: title.trim(), assigneeId: agentId, status: "in_progress", priority: "high" })
        const updated = [...loadTasks(), newTask]
        saveTasks(updated); setTasks(updated)
        setTimeout(() => {
          postMessage({ channelId: CHANNEL, authorType: "system", authorId: "system", authorName: "System", body: `Task created for ${AGENT_NAMES[agentId]}: "${title.trim()}"`, mentions: [], reactions: {}, taskId: newTask.id })
          setMessages(loadMessages(CHANNEL))
        }, 400)
        setTimeout(() => agentReply(agentId, { ...userMsg, body: title }), 700)
        return
      }
    }

    // Normal message
    const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
    setMessages(loadMessages(CHANNEL))
    const mentions = parseMentions(body)
    if (mentions.length === 0) {
      setTimeout(() => agentReply("01_director", userMsg), 300)
    } else if (mentions.length === 1 && mentions[0] !== "everyone") {
      setTimeout(() => agentReply(mentions[0], userMsg), 300)
    } else {
      const ids = mentions.includes("everyone") ? Object.keys(STANDUP_LINES) : mentions
      ids.forEach((id, i) => setTimeout(() => agentReply(id, userMsg), (i + 1) * 1100))
    }
  }

  function handleReact(messageId: string, emoji: string) {
    addReaction(messageId, emoji, USER_ID)
    setMessages(loadMessages(CHANNEL))
  }

  const recentTaskActivity = tasks
    .flatMap(t => t.activityLog.map(a => ({ ...a, taskTitle: t.title, assigneeId: t.assigneeId })))
    .sort((a, b) => {
      try { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() } catch { return 0 }
    })
    .slice(0, 5)

  const todayMsgCount = messages.filter(m => {
    try { return new Date(m.timestamp).toDateString() === new Date().toDateString() } catch { return false }
  }).length

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-[#F8FAFC]">

      {/* ── CHANNEL HEADER ─────────────────────────────── */}
      <header className="shrink-0 bg-white border-b border-[#E5ECF4] shadow-[0_1px_4px_0_rgba(15,76,129,0.06)]">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] flex items-center justify-center shadow-[0_4px_10px_-3px_rgba(15,76,129,0.4)]">
              <Hash className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-[#0F1B2D] text-base">sales-team</span>
                <span className="hidden sm:inline text-[11px] font-semibold text-[#64748B] border border-[#E5ECF4] bg-[#F8FAFC] px-2 py-0.5 rounded-full">
                  7 members
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] hidden sm:block">
                {todayMsgCount} messages today · All agents online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tasks"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#0F4C81] border border-[#DCE5EF] bg-white hover:bg-[#EAF2FA] hover:border-[#1B6EB7] px-3 py-1.5 rounded-xl transition-all"
            >
              <ClipboardList className="h-3.5 w-3.5" /> Task Board
            </Link>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0F4C81] border border-[#DCE5EF] bg-white hover:bg-[#EAF2FA] px-3 py-1.5 rounded-xl transition-all"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT SIDEBAR — agent roster (desktop) */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-[#E5ECF4]">
          <div className="px-4 py-3 border-b border-[#F1F5F9]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Team Members</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
            {MENTION_AGENTS.filter(a => a.slug !== "everyone" && a.slug !== "captain").map(agent => {
              const color = AGENT_COLORS[agent.id] ?? "#0F4C81"
              const isDonna = agent.slug === "donna"
              return (
                <div key={agent.slug} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] rounded-lg mx-2 transition-colors cursor-default">
                  <div className="relative shrink-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${color}aa, ${color})` }}
                    >
                      {agent.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-[#0F1B2D] truncate">{agent.name}</p>
                      {isDonna && (
                        <span className="text-[8px] font-black text-[#D4A537] border border-[#D4A537]/50 bg-[#FFF8E8] px-1 rounded uppercase tracking-wide">
                          Captain
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#94A3B8] truncate">{agent.role}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-[#F1F5F9] px-4 py-3">
            <Link href="/tasks" className="flex items-center gap-2 text-xs font-semibold text-[#1B6EB7] hover:text-[#0F4C81] transition-colors">
              <ClipboardList className="h-3.5 w-3.5" /> View Task Board
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
          </div>
        </aside>

        {/* CENTER — messages */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
            {messages.map((msg, i) => {
              const prevMsg = messages[i - 1]
              const showDivider = i === 0 || (
                prevMsg &&
                new Date(msg.timestamp.startsWith("SEED_") ? new Date() : msg.timestamp).toDateString() !==
                new Date(prevMsg.timestamp.startsWith("SEED_") ? new Date() : prevMsg.timestamp).toDateString()
              )
              return (
                <div key={msg.id}>
                  {showDivider && i > 0 && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-[#E5ECF4]" />
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Today</span>
                      <div className="flex-1 h-px bg-[#E5ECF4]" />
                    </div>
                  )}
                  <ChatMessageItem
                    message={msg}
                    isUser={msg.authorType === "user"}
                    onReact={handleReact}
                  />
                </div>
              )
            })}

            {/* Typing indicator */}
            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#64748B] to-[#475569] flex items-center justify-center text-white text-xs font-bold">
                    {typing.charAt(0)}
                  </div>
                  <div className="bg-white border border-[#E5ECF4] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                    <span className="text-xs text-[#94A3B8] ml-1">{typing} is typing…</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <ChatComposer onSend={handleSend} disabled={!!typing} />
        </div>

        {/* RIGHT SIDEBAR — channel details (collapsible) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="shrink-0 bg-white border-l border-[#E5ECF4] flex flex-col overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Channel Details</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-5">

                {/* Pinned */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Pinned</p>
                  {["Hotel Profile", "Current Goals"].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs font-semibold text-[#0F4C81] bg-[#EAF2FA] border border-[#C9DAEB] rounded-xl px-3 py-2 mb-1.5">
                      <Sparkles className="h-3 w-3 shrink-0" /> {item}
                    </div>
                  ))}
                </div>

                {/* Recent task activity */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Recent Tasks</p>
                  {recentTaskActivity.length === 0 ? (
                    <p className="text-xs text-[#94A3B8]">No activity yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {recentTaskActivity.map((a, i) => {
                        const color = AGENT_COLORS[a.assigneeId] ?? "#0F4C81"
                        return (
                          <div key={i} className="flex gap-2.5 items-start">
                            <div className="w-5 h-5 rounded-md shrink-0 mt-0.5" style={{ backgroundColor: color + "22" }}>
                              <div className="w-full h-full rounded-md flex items-center justify-center text-[9px] font-bold" style={{ color }}>{a.by.charAt(0)}</div>
                            </div>
                            <div>
                              <p className="text-[11px] text-[#0F1B2D] font-semibold leading-tight">{a.taskTitle}</p>
                              <p className="text-[10px] text-[#94A3B8]">{a.message}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Quick Actions</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Daily Standup", icon: Zap, cmd: "/standup" },
                      { label: "Status Update", icon: BarChart2, cmd: "/status" },
                    ].map(({ label, icon: Icon, cmd }) => (
                      <button
                        key={cmd}
                        onClick={() => handleSend(cmd)}
                        className="w-full flex items-center gap-2.5 text-xs font-bold text-[#0F4C81] border border-[#DCE5EF] bg-white hover:bg-[#EAF2FA] hover:border-[#1B6EB7] px-3 py-2.5 rounded-xl transition-all text-left"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" /> {label}
                      </button>
                    ))}
                    <Link
                      href="/tasks"
                      className="flex items-center gap-2.5 text-xs font-bold text-[#0F4C81] border border-[#DCE5EF] bg-white hover:bg-[#EAF2FA] hover:border-[#1B6EB7] px-3 py-2.5 rounded-xl transition-all"
                    >
                      <ClipboardList className="h-3.5 w-3.5 shrink-0" /> Open Task Board
                    </Link>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
