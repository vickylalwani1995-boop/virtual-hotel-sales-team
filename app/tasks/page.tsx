"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, LayoutGrid, List, ClipboardList, Crosshair, TrendingUp, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { TaskCard } from "@/components/TaskCard"
import { TaskDrawer } from "@/components/TaskDrawer"
import { NewTaskModal } from "@/components/NewTaskModal"
import {
  loadTasks, saveTasks, createTask, updateTaskStatus, addTaskComment,
  type Task, type TaskStatus,
  AGENT_COLORS, AGENT_NAMES, AGENT_ROLES, ALL_AGENT_IDS,
} from "@/lib/tasks"
import { postMessage } from "@/lib/team-chat"
import seedData from "@/sample-data/team-chat-seed.json"

type ViewMode  = "by-agent" | "by-status"
type FilterMode = "all" | "hot" | "today" | "overdue"

const STATUS_COLS: { key: TaskStatus; label: string; color: string; gradient: string }[] = [
  { key: "todo",        label: "To Do",       color: "#64748B", gradient: "from-[#64748B] to-[#475569]" },
  { key: "in_progress", label: "In Progress", color: "#2563EB", gradient: "from-[#3B82F6] to-[#2563EB]" },
  { key: "done",        label: "Done",        color: "#059669", gradient: "from-[#10B981] to-[#059669]" },
]

function resolveTs(ts: string): string {
  if (!ts.startsWith("SEED_")) return ts
  const now = new Date()
  const timeStr = ts.replace("SEED_TODAY_", "").replace("SEED_FRIDAY_", "").replace("SEED_", "")
  const [h, min] = timeStr.split(":").map(Number)
  const d = new Date(now)
  if (ts.includes("FRIDAY")) d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7))
  d.setHours(h, min, 0, 0)
  return d.toISOString()
}

function resolveTask(t: Task): Task {
  return {
    ...t,
    createdAt: resolveTs(t.createdAt),
    dueDate: t.dueDate ? resolveTs(t.dueDate) : undefined,
    completedAt: t.completedAt ? resolveTs(t.completedAt) : undefined,
    activityLog: t.activityLog.map(a => ({ ...a, timestamp: resolveTs(a.timestamp) })),
  }
}

export default function TasksPage() {
  const [tasks,        setTasks]        = useState<Task[]>([])
  const [view,         setView]         = useState<ViewMode>("by-agent")
  const [filter,       setFilter]       = useState<FilterMode>("all")
  const [selected,     setSelected]     = useState<Task | null>(null)
  const [showModal,    setShowModal]    = useState(false)
  const [defaultAgent, setDefaultAgent] = useState<string | undefined>()
  const [hydrated,     setHydrated]     = useState(false)

  useEffect(() => {
    const stored = loadTasks()
    if (stored.length > 0) {
      setTasks(stored)
    } else {
      const seeded = (seedData.tasks as Task[]).map(resolveTask)
      saveTasks(seeded)
      setTasks(seeded)
    }
    setHydrated(true)
  }, [])

  function persist(updated: Task[]) { setTasks(updated); saveTasks(updated) }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    const updated = updateTaskStatus(tasks, taskId, status)
    persist(updated)
    if (selected?.id === taskId) setSelected(updated.find(t => t.id === taskId) ?? null)
    if (status === "done") {
      const task = updated.find(t => t.id === taskId)
      if (task) {
        postMessage({ channelId: "sales-team", authorType: "system", authorId: "system", authorName: "System", body: `${AGENT_NAMES[task.assigneeId]} completed: "${task.title}"`, mentions: [], reactions: {}, taskId })
        toast.success("Task completed", { description: task.title })
      }
    }
  }

  function handleSubtaskToggle(taskId: string, subtaskId: string, done: boolean) {
    const updated = tasks.map(t => t.id !== taskId ? t : { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done } : s) })
    persist(updated)
    if (selected?.id === taskId) setSelected(updated.find(t => t.id === taskId) ?? null)
  }

  function handleAddComment(taskId: string, body: string) {
    const now = new Date().toISOString()
    const updated = tasks.map(t => t.id !== taskId ? t : { ...t, comments: [...t.comments, { id: Math.random().toString(36).slice(2), by: "You", body, timestamp: now }] })
    persist(updated)
    if (selected?.id === taskId) setSelected(updated.find(t => t.id === taskId) ?? null)
  }

  function handleDelete(taskId: string) { persist(tasks.filter(t => t.id !== taskId)); setSelected(null); toast.success("Task deleted") }
  function handleComplete(taskId: string) { handleStatusChange(taskId, "done"); setSelected(null) }

  function handleCreate(input: Partial<Task>) {
    const newTask = createTask(input)
    const updated = [...tasks, newTask]
    persist(updated)
    toast.success("Task created", { description: `${AGENT_NAMES[newTask.assigneeId]}: ${newTask.title}` })
    postMessage({ channelId: "sales-team", authorType: "system", authorId: "system", authorName: "System", body: `Task created for ${AGENT_NAMES[newTask.assigneeId]}: "${newTask.title}"`, mentions: [], reactions: {}, taskId: newTask.id })
  }

  const now = Date.now()
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const filtered = useMemo(() => {
    switch (filter) {
      case "hot":     return tasks.filter(t => t.priority === "high" && t.status !== "done")
      case "today":   return tasks.filter(t => new Date(t.createdAt).getTime() >= todayStart.getTime())
      case "overdue": return tasks.filter(t => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "done")
      default:        return tasks
    }
  }, [tasks, filter])

  const stats = useMemo(() => ({
    total:      filtered.length,
    inProgress: filtered.filter(t => t.status === "in_progress").length,
    done:       filtered.filter(t => t.status === "done").length,
    overdue:    tasks.filter(t => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "done").length,
  }), [filtered, tasks])

  const STAT_CARDS = [
    { label: "Total Tasks",  value: stats.total,      icon: ClipboardList,  tone: "navy" as const },
    { label: "In Progress",  value: stats.inProgress, icon: TrendingUp,     tone: "teal" as const },
    { label: "Completed",    value: stats.done,        icon: CheckCircle2,   tone: "teal" as const, highlight: true },
    { label: "Overdue",      value: stats.overdue,     icon: AlertTriangle,  tone: "navy" as const },
  ]

  return (
    <main>
      {/* ══ HERO BAND ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[#E5ECF4]">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "radial-gradient(900px 480px at 14% 0%, rgba(47,143,204,0.10), transparent 60%), radial-gradient(800px 480px at 92% 100%, rgba(15,76,129,0.08), transparent 65%), linear-gradient(180deg, #FCFDFE 0%, #F1F5FA 100%)" }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(15,76,129,0.7) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
                </span>
                Live Board
              </span>
              <h1 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
                Team Tasks.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-mhsp-muted leading-relaxed max-w-xl">
                Every agent's work, visible in one board. Assign, track, and close deals together.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* View toggle */}
              <div className="flex bg-white border border-[#DCE5EF] rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setView("by-agent")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${view === "by-agent" ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white" : "text-[#64748B] hover:bg-[#F4F8FC]"}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> By Agent
                </button>
                <button
                  onClick={() => setView("by-status")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${view === "by-status" ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white" : "text-[#64748B] hover:bg-[#F4F8FC]"}`}
                >
                  <List className="h-3.5 w-3.5" /> By Status
                </button>
              </div>
              <button
                onClick={() => { setDefaultAgent(undefined); setShowModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#D4A537] to-[#B8922E] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(212,165,55,0.5)] hover:opacity-90 transition-all"
              >
                <Plus className="h-4 w-4" /> New Task
              </button>
            </div>
          </div>

          {/* Stat cards */}
          {hydrated && (
            <div className="mt-9 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {STAT_CARDS.map(({ label, value, icon: Icon, tone, highlight }) => {
                const tile = tone === "navy"
                  ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
                  : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]"
                return (
                  <div
                    key={label}
                    className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_8px_28px_-12px_rgba(15,76,129,0.14),0_2px_8px_-4px_rgba(15,76,129,0.06)] ${
                      highlight ? "border-[#DCE5EF] bg-gradient-to-br from-[#F4F8FC] via-white to-white" : "border-[#E5ECF4] bg-white"
                    }`}
                  >
                    {highlight && <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-[0.08] pointer-events-none" style={{ background: "radial-gradient(closest-side, #1B6EB7, transparent)" }} />}
                    <div className="relative flex items-start gap-3">
                      <div className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-[0_6px_18px_-8px_rgba(15,76,129,0.5)] ${tile}`}>
                        <Icon className="h-5 w-5" strokeWidth={2.25} />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-[0.14em] uppercase text-mhsp-muted leading-tight">{label}</p>
                        <p className="mt-1.5 font-numeric text-2xl sm:text-[28px] font-bold text-mhsp-navy leading-none">{value}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ BOARD ════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all","hot","today","overdue"] as FilterMode[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm font-semibold tracking-wide rounded-full px-3.5 py-1.5 border transition-all capitalize ${
                filter === f
                  ? "bg-mhsp-navy text-white border-mhsp-navy shadow-sm"
                  : "bg-white text-mhsp-muted border-[#DCE5EF] hover:border-mhsp-navy/30 hover:text-mhsp-navy"
              }`}
            >
              {f === "all" ? `All (${tasks.length})` : f}
              {f === "overdue" && stats.overdue > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">
                  {stats.overdue}
                </span>
              )}
            </button>
          ))}
          <Link
            href="/team-chat"
            className="ml-auto text-sm font-semibold text-[#1B6EB7] hover:text-[#0F4C81] transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" /> Assign via chat
          </Link>
        </div>

        {!hydrated ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-7 w-7 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
          </div>
        ) : view === "by-agent" ? (

          /* ── BY AGENT ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {ALL_AGENT_IDS.map((agentId, colIdx) => {
              const agentTasks  = filtered.filter(t => t.assigneeId === agentId)
              const color       = AGENT_COLORS[agentId] ?? "#0F4C81"
              const activeCnt   = agentTasks.filter(t => t.status !== "done").length
              const doneCnt     = agentTasks.filter(t => t.status === "done").length

              return (
                <motion.div
                  key={agentId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: colIdx * 0.05 }}
                  className="flex flex-col bg-[#F8FAFC] rounded-2xl border border-[#E5ECF4] overflow-hidden shadow-[0_2px_8px_-4px_rgba(15,76,129,0.06)]"
                >
                  {/* Column header */}
                  <div className="px-4 py-4 bg-white border-b border-[#E5ECF4]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-[0_4px_10px_-3px_rgba(0,0,0,0.2)] shrink-0"
                        style={{ background: `linear-gradient(135deg, ${color}bb, ${color})` }}
                      >
                        {AGENT_NAMES[agentId]?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#0F1B2D] truncate">{AGENT_NAMES[agentId]}</p>
                        <p className="text-[11px] text-[#94A3B8] truncate">{AGENT_ROLES[agentId]}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] border border-[#E5ECF4] px-2 py-0.5 rounded-full">
                        {activeCnt} active
                      </span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 p-3 space-y-2.5 min-h-[60px]">
                    {agentTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5ECF4] flex items-center justify-center mb-2 shadow-sm">
                          <ClipboardList className="h-5 w-5 text-[#CBD5E1]" />
                        </div>
                        <p className="text-xs text-[#94A3B8]">No tasks</p>
                      </div>
                    ) : (
                      agentTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={setSelected}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>

                  {/* Add task footer */}
                  <button
                    onClick={() => { setDefaultAgent(agentId); setShowModal(true) }}
                    className="flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#0F4C81] hover:bg-white px-4 py-3 border-t border-[#E5ECF4] transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add task
                  </button>
                </motion.div>
              )
            })}
          </div>

        ) : (

          /* ── BY STATUS ── */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STATUS_COLS.map((col, colIdx) => {
              const colTasks = filtered.filter(t => t.status === col.key)
              return (
                <motion.div
                  key={col.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: colIdx * 0.06 }}
                  className="flex flex-col bg-[#F8FAFC] rounded-2xl border border-[#E5ECF4] overflow-hidden shadow-[0_2px_8px_-4px_rgba(15,76,129,0.06)]"
                >
                  <div className="px-4 py-3.5 bg-white border-b border-[#E5ECF4] flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm bg-gradient-to-br ${col.gradient}`}>
                      {col.key === "todo"        && <ClipboardList className="h-4 w-4" />}
                      {col.key === "in_progress" && <TrendingUp    className="h-4 w-4" />}
                      {col.key === "done"        && <CheckCircle2  className="h-4 w-4" />}
                    </div>
                    <span className="font-bold text-[#0F1B2D] text-sm">{col.label}</span>
                    <span className="ml-auto text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] border border-[#E5ECF4] px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  <div className="flex-1 p-3 space-y-2.5 min-h-[60px]">
                    {colTasks.length === 0 ? (
                      <p className="text-xs text-[#94A3B8] text-center py-8">No tasks</p>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard key={task.id} task={task} showAssignee onClick={setSelected} onStatusChange={handleStatusChange} />
                      ))
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-mhsp-muted">
          Assign via chat with{" "}
          <code className="bg-[#F1F5F9] border border-[#E5ECF4] px-1.5 py-0.5 rounded-lg font-mono text-[#0F4C81]">/task @agent description</code>
          {" "}·{" "}
          <Link href="/team-chat" className="text-[#1B6EB7] hover:text-[#0F4C81] font-semibold transition-colors">
            Open Team Chat →
          </Link>
        </p>
      </section>

      {selected && (
        <TaskDrawer
          task={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onSubtaskToggle={handleSubtaskToggle}
          onAddComment={handleAddComment}
          onDelete={handleDelete}
          onComplete={handleComplete}
        />
      )}
      {showModal && (
        <NewTaskModal
          defaultAssignee={defaultAgent}
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </main>
  )
}
