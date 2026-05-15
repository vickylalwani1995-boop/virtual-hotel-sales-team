"use client"

import { useState } from "react"
import { X, CheckSquare, Square, CheckCircle2, Trash2, Tag } from "lucide-react"
import { type Task, type TaskStatus, AGENT_COLORS, AGENT_NAMES, AGENT_ROLES } from "@/lib/tasks"

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo",        label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done",        label: "Done" },
]

const PRIORITY_BADGE: Record<string, string> = {
  high:   "text-red-700 bg-red-50 border-red-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  low:    "text-emerald-700 bg-emerald-50 border-emerald-200",
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

function fmtTs(ts: string): string {
  if (ts.startsWith("SEED_TODAY_")) return ts.replace("SEED_TODAY_", "Today ")
  if (ts.startsWith("SEED_")) return ts.replace(/SEED_\w+_/, "")
  try {
    return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  } catch { return ts }
}

export function TaskDrawer({ task, onClose, onStatusChange, onSubtaskToggle, onAddComment, onDelete, onComplete }: TaskDrawerProps) {
  const [comment, setComment] = useState("")
  const color  = AGENT_COLORS[task.assigneeId] ?? "#0F4C81"
  const done   = task.subtasks.filter(s => s.done).length
  const total  = task.subtasks.length
  const pct    = total > 0 ? Math.round((done / total) * 100) : null

  function submitComment() {
    if (!comment.trim()) return
    onAddComment(task.id, comment.trim())
    setComment("")
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0F1B2D]/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[500px] h-full shadow-[-24px_0_64px_-16px_rgba(15,76,129,0.2)] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5ECF4] bg-gradient-to-r from-[#F8FAFC] to-white">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-[0_4px_12px_-3px_rgba(0,0,0,0.2)] shrink-0"
              style={{ background: `linear-gradient(135deg, ${color}bb, ${color})` }}
            >
              {AGENT_NAMES[task.assigneeId]?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider truncate">{AGENT_NAMES[task.assigneeId]}</p>
              <p className="text-[10px] text-[#94A3B8] truncate">{AGENT_ROLES[task.assigneeId]}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F4C81] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Title */}
            <div>
              <h2 className="font-heading text-lg font-bold text-[#0F1B2D] leading-tight mb-4">{task.title}</h2>
              <div className="flex flex-wrap gap-2">
                <select
                  value={task.status}
                  onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
                  className="text-xs font-bold border border-[#DCE5EF] rounded-xl px-3 py-1.5 text-[#0F1B2D] bg-white focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/15 transition-all"
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border capitalize ${PRIORITY_BADGE[task.priority]}`}>
                  {task.priority} priority
                </span>
                {task.dueDate && (
                  <span className="text-xs font-semibold text-[#64748B] border border-[#DCE5EF] bg-[#F8FAFC] px-3 py-1.5 rounded-xl">
                    Due {fmtTs(task.dueDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Progress */}
            {pct !== null && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Progress</p>
                  <p className="text-[11px] font-bold text-[#0F4C81] font-numeric">{pct}%</p>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            )}

            {/* Description */}
            {task.description && (
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-[#475569] leading-relaxed bg-[#F8FAFC] border border-[#E5ECF4] rounded-xl px-4 py-3">
                  {task.description}
                </p>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Subtasks — {done}/{total} done
                </p>
                <div className="space-y-1.5">
                  {task.subtasks.map(st => (
                    <button
                      key={st.id}
                      onClick={() => onSubtaskToggle(task.id, st.id, !st.done)}
                      className="w-full flex items-center gap-3 text-sm text-left hover:bg-[#F8FAFC] rounded-xl px-3 py-2 transition-colors group"
                    >
                      {st.done
                        ? <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                        : <Square className="h-4 w-4 text-[#CBD5E1] shrink-0 group-hover:text-[#0F4C81]" />
                      }
                      <span className={st.done ? "line-through text-[#94A3B8]" : "text-[#0F1B2D] font-medium"}>{st.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EAF2FA] text-[#0F4C81] border border-[#C9DAEB] px-2.5 py-1 rounded-full">
                      <Tag className="h-3 w-3" />{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">Activity</p>
              <div className="relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#E5ECF4]" />
                <div className="space-y-3 pl-7">
                  {task.activityLog.map((a, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#CBD5E1]" />
                      <p className="text-xs text-[#64748B]">
                        <span className="font-semibold text-[#0F1B2D]">{a.by}</span> {a.message}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{fmtTs(a.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Comments</p>
              {task.comments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {task.comments.map(c => (
                    <div key={c.id} className="bg-[#F8FAFC] border border-[#E5ECF4] rounded-xl px-4 py-3">
                      <div className="flex gap-2 text-[10px] text-[#94A3B8] mb-1">
                        <span className="font-bold text-[#475569]">{c.by}</span>
                        <span>{fmtTs(c.timestamp)}</span>
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
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitComment()}
                  placeholder="Add a comment…"
                  className="flex-1 text-sm border border-[#DCE5EF] rounded-xl px-3 py-2 focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/15 transition-all"
                />
                <button onClick={submitComment} className="px-4 py-2 bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_12px_-3px_rgba(15,76,129,0.4)]">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5ECF4] px-6 py-4 flex gap-2.5">
          {task.status !== "done" && (
            <button
              onClick={() => { onComplete(task.id); onClose() }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_14px_-4px_rgba(16,185,129,0.5)]"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark Complete
            </button>
          )}
          <button
            onClick={() => { onDelete(task.id); onClose() }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-red-600 border border-red-200 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
