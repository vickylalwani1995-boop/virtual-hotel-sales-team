"use client"

import { useEffect, useState, useMemo } from "react"
import { Plus, LayoutGrid, List, ClipboardList } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { TaskCard } from "@/components/TaskCard"
import { TaskDrawer } from "@/components/TaskDrawer"
import { NewTaskModal } from "@/components/NewTaskModal"
import {
  loadTasks, saveTasks, createTask, updateTaskStatus, addTaskActivity, addTaskComment,
  getTasksByStatus, type Task, type TaskStatus,
  AGENT_COLORS, AGENT_NAMES, AGENT_ROLES, ALL_AGENT_IDS,
} from "@/lib/tasks"
import { loadMessages, saveMessages, postMessage } from "@/lib/team-chat"
import seedData from "@/sample-data/team-chat-seed.json"

type ViewMode = "by-agent" | "by-status"
type FilterMode = "all" | "hot" | "today" | "overdue"

const STATUS_COLS: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo",        label: "To Do",       color: "#64748B" },
  { key: "in_progress", label: "In Progress", color: "#3B82F6" },
  { key: "done",        label: "Done",        color: "#10B981" },
]

const PRIORITY_DOT: Record<string, string> = {
  high:   "bg-red-500",
  medium: "bg-yellow-400",
  low:    "bg-green-500",
}

function resolveTimestamp(ts: string): string {
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
    createdAt: resolveTimestamp(t.createdAt),
    dueDate: t.dueDate ? resolveTimestamp(t.dueDate) : undefined,
    completedAt: t.completedAt ? resolveTimestamp(t.completedAt) : undefined,
    activityLog: t.activityLog.map((a) => ({ ...a, timestamp: resolveTimestamp(a.timestamp) })),
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<ViewMode>("by-agent")
  const [filter, setFilter] = useState<FilterMode>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newTaskAssignee, setNewTaskAssignee] = useState<string | undefined>()

  // Load or seed tasks
  useEffect(() => {
    const stored = loadTasks()
    if (stored.length > 0) {
      setTasks(stored)
    } else {
      const seeded = (seedData.tasks as Task[]).map(resolveTask)
      saveTasks(seeded)
      setTasks(seeded)
    }
  }, [])

  function persist(updated: Task[]) {
    setTasks(updated)
    saveTasks(updated)
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    const updated = updateTaskStatus(tasks, taskId, status)
    persist(updated)
    if (selectedTask?.id === taskId) {
      setSelectedTask(updated.find((t) => t.id === taskId) ?? null)
    }
    if (status === "done") {
      const task = updated.find((t) => t.id === taskId)
      if (task) {
        postMessage({ channelId: "sales-team", authorType: "system", authorId: "system", authorName: "System", body: `${AGENT_NAMES[task.assigneeId]} completed: "${task.title}"`, mentions: [], reactions: {}, taskId })
        toast.success(`Task completed`, { description: task.title })
      }
    }
  }

  function handleSubtaskToggle(taskId: string, subtaskId: string, done: boolean) {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t
      return { ...t, subtasks: t.subtasks.map((s) => s.id === subtaskId ? { ...s, done } : s) }
    })
    persist(updated)
    if (selectedTask?.id === taskId) setSelectedTask(updated.find((t) => t.id === taskId) ?? null)
  }

  function handleAddComment(taskId: string, body: string) {
    const updated = addTaskComment(tasks, taskId, body, "You")
    persist(updated)
    if (selectedTask?.id === taskId) setSelectedTask(updated.find((t) => t.id === taskId) ?? null)
  }

  function handleDelete(taskId: string) {
    persist(tasks.filter((t) => t.id !== taskId))
    setSelectedTask(null)
    toast.success("Task deleted")
  }

  function handleComplete(taskId: string) {
    handleStatusChange(taskId, "done")
    setSelectedTask(null)
  }

  function handleCreate(input: Partial<Task>) {
    const newTask = createTask(input)
    const updated = [...tasks, newTask]
    persist(updated)
    toast.success("Task created", { description: `${AGENT_NAMES[newTask.assigneeId]}: ${newTask.title}` })
    postMessage({ channelId: "sales-team", authorType: "system", authorId: "system", authorName: "System", body: `Task created for ${AGENT_NAMES[newTask.assigneeId]}: "${newTask.title}"`, mentions: [], reactions: {}, taskId: newTask.id })
  }

  const now = Date.now()
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)

  const filtered = useMemo(() => {
    switch (filter) {
      case "hot":     return tasks.filter((t) => t.priority === "high" && t.status !== "done")
      case "today":   return tasks.filter((t) => new Date(t.createdAt).getTime() >= startOfDay.getTime())
      case "overdue": return tasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "done")
      default:        return tasks
    }
  }, [tasks, filter])

  const todo        = filtered.filter((t) => t.status === "todo").length
  const inProgress  = filtered.filter((t) => t.status === "in_progress").length
  const done        = filtered.filter((t) => t.status === "done").length
  const overdue     = tasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "done").length

  return (
    <main className="min-h-screen bg-[#F4F8FC]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F4C81] tracking-tight">Team Tasks</h1>
            <p className="mt-1 text-[#5A6B82] text-sm">Live project board across all 6 agents</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle */}
            <div className="flex bg-white border border-[#DCE5EF] rounded-lg overflow-hidden">
              <button
                onClick={() => setView("by-agent")}
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "by-agent" ? "bg-[#0F4C81] text-white" : "text-[#5A6B82] hover:bg-[#F4F8FC]"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> By Agent
              </button>
              <button
                onClick={() => setView("by-status")}
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "by-status" ? "bg-[#0F4C81] text-white" : "text-[#5A6B82] hover:bg-[#F4F8FC]"}`}
              >
                <List className="h-3.5 w-3.5" /> By Status
              </button>
            </div>
            <button
              onClick={() => { setNewTaskAssignee(undefined); setShowNewModal(true) }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#D4A537] hover:bg-[#B8922E] text-white text-sm font-bold rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" /> New Task
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Tasks", value: filtered.length, color: "#0F4C81" },
            { label: "In Progress", value: inProgress,      color: "#3B82F6" },
            { label: "Completed",   value: done,            color: "#10B981" },
            { label: "Overdue",     value: overdue,         color: "#EF4444" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col gap-0.5">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[#5A6B82] uppercase tracking-wide font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(["all", "hot", "today", "overdue"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize transition-all ${
                filter === f
                  ? "bg-[#0F4C81] text-white border-[#0F4C81]"
                  : "bg-white text-[#5A6B82] border-[#DCE5EF] hover:border-[#0F4C81] hover:text-[#0F4C81]"
              }`}
            >
              {f === "all" ? `All (${tasks.length})` : f === "hot" ? "Hot" : f === "today" ? "Today" : "Overdue"}
              {f === "overdue" && overdue > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[9px] font-bold rounded-full px-1">{overdue}</span>
              )}
            </button>
          ))}
        </div>

        {/* BOARD */}
        {view === "by-agent" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_AGENT_IDS.map((agentId) => {
              const agentTasks = filtered.filter((t) => t.assigneeId === agentId)
              const color = AGENT_COLORS[agentId] ?? "#0F4C81"
              const doneCount = agentTasks.filter((t) => t.status === "done").length
              const activeCount = agentTasks.filter((t) => t.status !== "done").length
              return (
                <div key={agentId} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex flex-col overflow-hidden">
                  {/* Column header */}
                  <div className="px-4 py-3 border-b border-[#E2E8F0] bg-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: color }}>
                        {AGENT_NAMES[agentId]?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F1B2D]">{AGENT_NAMES[agentId]}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{AGENT_ROLES[agentId]}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] mt-1">{activeCount} active · {doneCount} done</p>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 p-3 flex flex-col gap-2 min-h-[80px]">
                    {agentTasks.length === 0 ? (
                      <p className="text-xs text-[#9CA3AF] text-center py-4">No tasks</p>
                    ) : (
                      agentTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={setSelectedTask}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>

                  {/* Add task */}
                  <button
                    onClick={() => { setNewTaskAssignee(agentId); setShowNewModal(true) }}
                    className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#0F4C81] px-4 py-3 border-t border-[#E2E8F0] hover:bg-white transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add task
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          // By Status view
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATUS_COLS.map((col) => {
              const colTasks = filtered.filter((t) => t.status === col.key)
              return (
                <div key={col.key} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E2E8F0] bg-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-sm font-bold text-[#0F1B2D]">{col.label}</span>
                    <span className="ml-auto text-xs text-[#9CA3AF]">{colTasks.length}</span>
                  </div>
                  <div className="flex-1 p-3 flex flex-col gap-2 min-h-[80px]">
                    {colTasks.length === 0 ? (
                      <p className="text-xs text-[#9CA3AF] text-center py-4">No tasks</p>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          showAssignee
                          onClick={setSelectedTask}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[#9CA3AF]">
          Assign tasks via chat with <code className="bg-[#F1F5F9] px-1 py-0.5 rounded">/task @agent description</code> ·{" "}
          <Link href="/team-chat" className="text-[#1B6EB7] hover:underline">Open Team Chat →</Link>
        </p>
      </div>

      {/* Drawers + modals */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          onSubtaskToggle={handleSubtaskToggle}
          onAddComment={handleAddComment}
          onDelete={handleDelete}
          onComplete={handleComplete}
        />
      )}

      {showNewModal && (
        <NewTaskModal
          defaultAssignee={newTaskAssignee}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
    </main>
  )
}
