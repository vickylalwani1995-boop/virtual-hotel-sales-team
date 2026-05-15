"use client"

import { useState } from "react"
import { X, CheckSquare, Square, MessageSquare, Trash2, RefreshCw, CheckCircle2 } from "lucide-react"
import { type Task, type TaskStatus, AGENT_COLORS, AGENT_NAMES, AGENT_ROLES } from "@/lib/tasks"

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

const PRIORITY_COLORS: Record<string, string> = {
  high:   "text-red-600 bg-red-50 border-red-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  low:    "text-green-700 bg-green-50 border-green-200",
}

interface TaskDrawerProps {
  task: Task
  onClose: () => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onSubtaskToggle: (taskId: string, subtaskId: string, done: boolean) => void
  onAddComment: (taskId: string, body: string) => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
}

export function TaskDrawer({ task, onClose, onStatusChange, onSubtaskToggle, onAddComment, onDelete, onComplete }: TaskDrawerProps) {
  const [comment, setComment] = useState("")
  const color = AGENT_COLORS[task.assigneeId] ?? "#0F4C81"

  function formatTs(ts: string) {
    if (ts.startsWith("SEED_TODAY_")) return ts.replace("SEED_TODAY_", "Today ")
    if (ts.startsWith("SEED_")) return ts.replace(/SEED_\w+_/, "")
    try { return new Date(ts).toLocaleTimeString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }
    catch { return ts }
  }

  function submitComment() {
    if (!comment.trim()) return
    onAddComment(task.id, comment.trim())
    setComment("")
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0F1B2D]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[480px] h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[11px] font-semibold text-[#5A6B82] uppercase tracking-wide">
              {AGENT_NAMES[task.assigneeId]} · {AGENT_ROLES[task.assigneeId]}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A6B82] hover:bg-[#F4F8FC] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Title + meta */}
          <div>
            <h2 className="text-lg font-bold text-[#0F1B2D] leading-tight mb-3">{task.title}</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="text-xs border border-[#DCE5EF] rounded-lg px-2 py-1 text-[#0F1B2D] bg-white focus:outline-none focus:border-[#1B6EB7]"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg border capitalize ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority} priority
              </span>
              {task.dueDate && (
                <span className="text-xs text-[#5A6B82] border border-[#DCE5EF] px-2 py-1 rounded-lg">
                  Due {formatTs(task.dueDate)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide mb-1.5">Description</h3>
              <p className="text-sm text-[#5A6B82] leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide mb-2">
                Subtasks ({task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} complete)
              </h3>
              <div className="flex flex-col gap-1.5">
                {task.subtasks.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onSubtaskToggle(task.id, st.id, !st.done)}
                    className="flex items-center gap-2 text-sm text-left hover:bg-[#F8FAFC] rounded-lg px-2 py-1.5 transition-colors group"
                  >
                    {st.done ? (
                      <CheckSquare className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    )}
                    <span className={st.done ? "line-through text-[#9CA3AF]" : "text-[#0F1B2D]"}>{st.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide mb-1.5">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#EAF2FA] text-[#0F4C81] px-2 py-0.5 rounded-md">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Activity log */}
          <div>
            <h3 className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide mb-2">Activity</h3>
            <div className="flex flex-col gap-1.5">
              {task.activityLog.map((entry, i) => (
                <div key={i} className="flex gap-2 text-xs text-[#5A6B82]">
                  <span className="shrink-0 text-[#9CA3AF]">{formatTs(entry.timestamp)}</span>
                  <span className="font-medium">{entry.by}:</span>
                  <span>{entry.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide mb-2">Comments</h3>
            {task.comments.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {task.comments.map((c) => (
                  <div key={c.id} className="bg-[#F8FAFC] rounded-lg px-3 py-2">
                    <div className="flex gap-2 text-[11px] text-[#9CA3AF] mb-0.5">
                      <span className="font-semibold text-[#5A6B82]">{c.by}</span>
                      <span>{formatTs(c.timestamp)}</span>
                    </div>
                    <p className="text-sm text-[#0F1B2D]">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Add a comment..."
                className="flex-1 text-sm border border-[#DCE5EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/20"
              />
              <button onClick={submitComment} className="px-3 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#1B6EB7] transition-colors">
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#E2E8F0] px-5 py-3 flex gap-2">
          {task.status !== "done" && (
            <button
              onClick={() => { onComplete(task.id); onClose() }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark Complete
            </button>
          )}
          <button
            onClick={() => { onDelete(task.id); onClose() }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-red-600 border border-red-200 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
