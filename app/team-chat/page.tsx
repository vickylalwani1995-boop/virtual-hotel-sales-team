"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Users, Hash, ChevronRight, ChevronLeft, Zap, ClipboardList, BarChart2, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { ChatMessageItem } from "@/components/ChatMessage"
import { ChatComposer } from "@/components/ChatComposer"
import { type ChatMessage, loadMessages, saveMessages, postMessage, parseMentions, addReaction, formatTime, MENTION_AGENTS } from "@/lib/team-chat"
import { AGENT_COLORS, AGENT_NAMES, AGENT_ROLES, AGENT_SLUGS, createTask, loadTasks, saveTasks, type Task } from "@/lib/tasks"
import seedData from "@/sample-data/team-chat-seed.json"

const CHANNEL = "sales-team"
const USER_ID = "user"

// Agent personas for quick team-chat replies (max 3 sentences)
const AGENT_PERSONAS: Record<string, string> = {
  "01_director":  "You are Donna Marie, Director of Sales. Reply like a confident team captain — concise, decisive, routing tasks clearly. Max 3 sentences.",
  "02_lead_gen":  "You are Marcus Reed, Lead Generation Specialist. Reply like a data-driven hustler — energetic, metric-focused. Max 3 sentences.",
  "03_outbound":  "You are Sarah Chen, Outbound Sales Manager. Reply like a sharp outreach specialist — direct, action-oriented. Max 3 sentences.",
  "04_rfp_group": "You are Priya Sharma, Group & RFP Sales Lead. Reply like a polished closer — professional, detail-oriented. Max 3 sentences.",
  "05_retention": "You are Liam Chen, Customer Success Specialist. Reply like a caring retention expert — empathetic, proactive. Max 3 sentences.",
  "06_revenue":   "You are Maya Reddy, Revenue Analytics Manager. Reply like a data analyst — precise, numbers-first. Max 3 sentences.",
}

const QUICK_REPLIES: Record<string, string[]> = {
  "01_director":  ["On it. I'll route to the right agent and confirm by end of day.", "Good question. Let me brief the team and get back to you.", "Routing this to the specialist now. Stand by."],
  "02_lead_gen":  ["Starting now. I'll have leads ready within 30 minutes.", "On it. Apollo search running — I'll upload results to Lead Manager.", "Got it. I'll pull and enrich the list. ETA: end of day."],
  "03_outbound":  ["On it. Drafting the sequence now — first touch goes out today.", "Got them. Running sentiment qual before sequencing. Hot leads first.", "Drafting 3 variants. I'll have them ready for review in 20 min."],
  "04_rfp_group": ["On it. I'll have a draft proposal ready for your review.", "Working on it now. I'll check availability and price the block.", "Draft ready. @donna can you review before I send?"],
  "05_retention": ["On it. Scheduling post-stay calls now.", "Already on it. Win-back sequence drafted and ready to go.", "Got it. I'll pull the guest list and start the review request sequence."],
  "06_revenue":   ["Numbers updated. Running the analysis now.", "Pulling pickup data. I'll have the breakdown to you within the hour.", "On it. Comp set check running — I'll flag any rate opportunities."],
}

function resolveSeededTimestamps(messages: ChatMessage[]): ChatMessage[] {
  const now = new Date()
  return messages.map((m) => {
    if (!m.timestamp.startsWith("SEED_")) return m
    const timeStr = m.timestamp.replace("SEED_TODAY_", "").replace("SEED_", "")
    const [h, min] = timeStr.split(":").map(Number)
    const d = new Date(now)
    d.setHours(h, min, 0, 0)
    return { ...m, timestamp: d.toISOString() }
  })
}

function resolveSeededTaskTimestamps(tasks: Task[]): Task[] {
  const now = new Date()
  function resolve(ts: string): string {
    if (!ts.startsWith("SEED_")) return ts
    const timeStr = ts.replace("SEED_TODAY_", "").replace("SEED_FRIDAY_", "").replace("SEED_", "")
    const [h, min] = timeStr.split(":").map(Number)
    const d = new Date(now)
    if (ts.includes("FRIDAY")) d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7))
    d.setHours(h, min, 0, 0)
    return d.toISOString()
  }
  return tasks.map((t) => ({
    ...t,
    createdAt: resolve(t.createdAt),
    dueDate: t.dueDate ? resolve(t.dueDate) : undefined,
    completedAt: t.completedAt ? resolve(t.completedAt) : undefined,
    activityLog: t.activityLog.map((a) => ({ ...a, timestamp: resolve(a.timestamp) })),
  }))
}

export default function TeamChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState<string | null>(null)
  const [rightOpen, setRightOpen] = useState(true)
  const [leftOpen, setLeftOpen] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [unread] = useState<Record<string, number>>({})
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load or seed data
  useEffect(() => {
    const stored = loadMessages(CHANNEL)
    if (stored.length > 0) {
      setMessages(stored)
    } else {
      const seeded = resolveSeededTimestamps(seedData.messages as unknown as ChatMessage[])
      saveMessages(seeded)
      setMessages(seeded)
    }

    const storedTasks = loadTasks()
    if (storedTasks.length > 0) {
      setTasks(storedTasks)
    } else {
      const seededTasks = resolveSeededTaskTimestamps(seedData.tasks as Task[])
      saveTasks(seededTasks)
      setTasks(seededTasks)
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  function persistMessages(msgs: ChatMessage[]) {
    setMessages(msgs)
    saveMessages(msgs)
  }

  const agentReply = useCallback(async (agentId: string, trigger: ChatMessage) => {
    setTyping(AGENT_NAMES[agentId])
    const delay = 1500 + Math.random() * 1000

    // Call AI endpoint for richer replies
    try {
      const persona = AGENT_PERSONAS[agentId]
      const stored = loadMessages(CHANNEL)
      const history = stored.slice(-10).map((m) => ({
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
            { role: "user", content: `[Team Chat - keep reply to 2-3 sentences max, no markdown headers, conversational]\n${persona}\n\nUser message: ${trigger.body}` },
          ],
          teamBriefing: "",
        }),
      })

      if (!resp.ok || !resp.body) throw new Error("stream failed")

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) continue
          try {
            const evt = JSON.parse(trimmed.slice(5))
            if (evt.type === "text") fullText += evt.text
          } catch { /* skip */ }
        }
      }

      setTimeout(() => {
        setTyping(null)
        const reply = postMessage({
          channelId: CHANNEL,
          authorType: "agent",
          authorId: agentId,
          authorName: AGENT_NAMES[agentId],
          body: fullText.trim() || (QUICK_REPLIES[agentId]?.[0] ?? "On it."),
          mentions: [],
          reactions: {},
        })
        setMessages(loadMessages(CHANNEL))
      }, delay)
    } catch {
      const replies = QUICK_REPLIES[agentId]
      const reply = replies?.[Math.floor(Math.random() * replies.length)] ?? "On it."
      setTimeout(() => {
        setTyping(null)
        postMessage({
          channelId: CHANNEL,
          authorType: "agent",
          authorId: agentId,
          authorName: AGENT_NAMES[agentId],
          body: reply,
          mentions: [],
          reactions: {},
        })
        setMessages(loadMessages(CHANNEL))
      }, delay)
    }
  }, [])

  async function handleSend(body: string) {
    // Parse slash commands
    const lower = body.trim().toLowerCase()

    if (lower === "/help") {
      const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setMessages(loadMessages(CHANNEL))
      setTimeout(() => {
        postMessage({
          channelId: CHANNEL, authorType: "system", authorId: "system", authorName: "System",
          body: "Commands: /task @agent description · /status · /brief · /standup · /help",
          mentions: [], reactions: {},
        })
        setMessages(loadMessages(CHANNEL))
      }, 500)
      return
    }

    if (lower === "/standup") {
      const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setMessages(loadMessages(CHANNEL))
      const standupLines: Record<string, string> = {
        "01_director":  "Working on pipeline review and RFP approval for Priya's Texas Restaurant Association proposal.",
        "02_lead_gen":  "Enriching 25 Dallas medical leads. Handing top 10 to Sarah by noon.",
        "03_outbound":  "Sequencing 8 hot leads from Marcus. First email goes out at 2 PM.",
        "04_rfp_group": "Finalizing Texas Restaurant Association RFP draft. Waiting on Donna's approval.",
        "05_retention": "Post-stay calls scheduled. Running review request sequence for 12 recent guests.",
        "06_revenue":   "Pickup +14% WoW. Sun-Tue closing. Owner brief going out at 5.",
      }
      const agentIds = Object.keys(AGENT_PERSONAS)
      agentIds.forEach((agentId, i) => {
        setTimeout(() => {
          postMessage({
            channelId: CHANNEL, authorType: "agent",
            authorId: agentId, authorName: AGENT_NAMES[agentId],
            body: standupLines[agentId] ?? "Working on my assigned tasks.",
            mentions: [], reactions: {},
          })
          setMessages(loadMessages(CHANNEL))
        }, (i + 1) * 800)
      })
      return
    }

    if (lower === "/status") {
      const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setMessages(loadMessages(CHANNEL))
      setTimeout(() => { agentReply("01_director", { body: "Give me a status update of the whole team.", id: "", channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", timestamp: new Date().toISOString(), mentions: [], reactions: {} }) }, 300)
      return
    }

    if (lower === "/brief") {
      const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [], reactions: {} })
      setMessages(loadMessages(CHANNEL))
      setTimeout(() => { agentReply("06_revenue", { body: "Generate the daily owner brief.", id: "", channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", timestamp: new Date().toISOString(), mentions: [], reactions: {} }) }, 300)
      return
    }

    // /task @agent description
    const taskMatch = body.match(/^\/task\s+@(\w+)\s+(.+)/i)
    if (taskMatch) {
      const [, slug, taskTitle] = taskMatch
      const agentId = AGENT_SLUGS[slug.toLowerCase()]
      if (agentId) {
        const userMsg = postMessage({ channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You", body, mentions: [agentId], reactions: {} })
        setMessages(loadMessages(CHANNEL))

        const newTask = createTask({ title: taskTitle.trim(), assigneeId: agentId, status: "in_progress", priority: "high" })
        const updatedTasks = [...loadTasks(), newTask]
        saveTasks(updatedTasks)
        setTasks(updatedTasks)

        setTimeout(() => {
          postMessage({ channelId: CHANNEL, authorType: "system", authorId: "system", authorName: "System", body: `Task created for ${AGENT_NAMES[agentId]}: "${taskTitle.trim()}"`, mentions: [], reactions: {}, taskId: newTask.id })
          setMessages(loadMessages(CHANNEL))
        }, 400)
        setTimeout(() => { agentReply(agentId, { ...userMsg, body: taskTitle }) }, 600)
        return
      }
    }

    // Normal message
    const userMsg = postMessage({
      channelId: CHANNEL, authorType: "user", authorId: USER_ID, authorName: "You",
      body, mentions: [], reactions: {},
    })
    setMessages(loadMessages(CHANNEL))

    const mentions = parseMentions(body)
    if (mentions.length === 0) {
      // No tag → Donna routes
      setTimeout(() => agentReply("01_director", userMsg), 300)
    } else if (mentions.length === 1 && mentions[0] !== "everyone") {
      setTimeout(() => agentReply(mentions[0], userMsg), 300)
    } else {
      // @everyone or multiple tags
      const agentIds = mentions.includes("everyone") ? Object.keys(AGENT_PERSONAS) : mentions
      agentIds.forEach((agentId, i) => {
        setTimeout(() => agentReply(agentId, userMsg), (i + 1) * 1200)
      })
    }
  }

  function handleReact(messageId: string, emoji: string) {
    addReaction(messageId, emoji, USER_ID)
    setMessages(loadMessages(CHANNEL))
  }

  const recentTaskActivity = tasks
    .flatMap((t) => t.activityLog.map((a) => ({ ...a, taskTitle: t.title, taskId: t.id })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <main className="h-[calc(100vh-56px)] flex bg-[#F4F8FC] overflow-hidden">

      {/* LEFT SIDEBAR */}
      <aside className={`${leftOpen ? "w-64" : "w-0"} shrink-0 transition-all duration-200 overflow-hidden bg-white border-r border-[#E2E8F0] flex flex-col`}>
        <div className="px-4 py-4 border-b border-[#F1F5F9]">
          <p className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Team Members</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {MENTION_AGENTS.filter((a) => a.slug !== "everyone" && a.slug !== "captain").map((agent) => {
            const color = AGENT_COLORS[agent.id] ?? "#0F4C81"
            const isDonna = agent.slug === "donna"
            return (
              <div key={agent.slug} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors">
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#0F1B2D] truncate">{agent.name}</p>
                    {isDonna && (
                      <span className="text-[9px] font-bold text-[#D4A537] border border-[#D4A537]/40 px-1 rounded">Captain</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] truncate">{agent.role}</p>
                </div>
                {(unread[agent.id] ?? 0) > 0 && (
                  <span className="shrink-0 w-4 h-4 rounded-full bg-[#0F4C81] text-white text-[9px] font-bold flex items-center justify-center">
                    {unread[agent.id]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div className="px-4 py-3 border-t border-[#F1F5F9]">
          <button disabled className="w-full text-xs text-[#9CA3AF] flex items-center gap-2 py-1" title="Coming soon">
            <Plus className="h-3.5 w-3.5" /> Add member
          </button>
        </div>
      </aside>

      {/* LEFT TOGGLE */}
      <button
        onClick={() => setLeftOpen(!leftOpen)}
        className="absolute left-0 z-10 top-1/2 -translate-y-1/2 w-5 h-10 bg-white border border-[#E2E8F0] rounded-r-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#0F4C81] hover:bg-[#F4F8FC] transition-colors shadow-sm"
        style={{ left: leftOpen ? "256px" : "0" }}
      >
        {leftOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* CENTER — MAIN CHAT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-[#5A6B82]" />
            <span className="font-bold text-[#0F1B2D] text-sm">sales-team</span>
            <span className="text-xs text-[#9CA3AF] border border-[#E2E8F0] px-2 py-0.5 rounded-full">7 members</span>
          </div>
          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="text-xs text-[#5A6B82] hover:text-[#0F4C81] flex items-center gap-1 transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            Channel Details
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              isUser={msg.authorType === "user"}
              onReact={handleReact}
            />
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF] italic px-2">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
              {typing} is typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <ChatComposer onSend={handleSend} disabled={!!typing} />
      </div>

      {/* RIGHT SIDEBAR */}
      {rightOpen && (
        <aside className="w-72 shrink-0 bg-white border-l border-[#E2E8F0] flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-[#F1F5F9]">
            <p className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Channel Details</p>
          </div>
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-4 px-4">
            {/* Pinned */}
            <div>
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Pinned</p>
              <div className="flex flex-col gap-1.5">
                {["Hotel Profile", "Current Goals"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-[#0F4C81] bg-[#EAF2FA] rounded-lg px-3 py-2">
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Activity */}
            <div>
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Recent Task Activity</p>
              {recentTaskActivity.length === 0 ? (
                <p className="text-xs text-[#9CA3AF]">No task activity yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTaskActivity.map((a, i) => (
                    <div key={i} className="text-[11px] text-[#5A6B82]">
                      <span className="font-semibold text-[#0F1B2D]">{a.by}:</span> {a.message}
                      <p className="text-[#9CA3AF] truncate">{a.taskTitle}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div>
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Quick Actions</p>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => handleSend("/brief")} className="text-xs text-left px-3 py-2 rounded-lg border border-[#DCE5EF] hover:bg-[#EAF2FA] text-[#0F4C81] font-semibold transition-colors flex items-center gap-2">
                  <BarChart2 className="h-3.5 w-3.5" /> Daily Standup
                </button>
                <button onClick={() => handleSend("/standup")} className="text-xs text-left px-3 py-2 rounded-lg border border-[#DCE5EF] hover:bg-[#EAF2FA] text-[#0F4C81] font-semibold transition-colors flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" /> Status Update
                </button>
                <Link href="/tasks" className="text-xs text-left px-3 py-2 rounded-lg border border-[#DCE5EF] hover:bg-[#EAF2FA] text-[#0F4C81] font-semibold transition-colors flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5" /> Open Task Board
                </Link>
              </div>
            </div>
          </div>
        </aside>
      )}
    </main>
  )
}
