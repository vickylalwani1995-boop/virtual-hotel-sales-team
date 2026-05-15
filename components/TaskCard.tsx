"use client"

import { CheckCircle2, Clock, Circle, ArrowRight } from "lucide-react"
import { AGENT_COLORS, AGENT_NAMES, type Task, type TaskStatus } from "@/lib/tasks"

const STATUS_CONFIG: Record<TaskStatus, { label: string; cls: string }> = {
  todo:        { label: "To Do",       cls: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]" },
  in_progress: { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  done:        { label: "Done",        cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
}

const PRIORITY_DOT: Record<string, string> = {
  high:   "bg-red-500",
  medium: "bg-amber-400",
  low:    "bg-emerald-500",
}

interface TaskCardProps {
  task: Task
  showAssignee?: boolean
  onClick: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
}

export function TaskCard({ task, showAssignee, onClick, onStatusChange }: TaskCardProps) {
  const color = AGENT_COLORS[task.assigneeId] ?? "#0F4C81"
  const cfg   = STATUS_CONFIG[task.status]
  const done  = task.subtasks.filter(s => s.done).length
  const total = task.subtasks.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : null

  function cycleStatus(e: React.MouseEvent) {
    e.stopPropagation()
    if (!onStatusChange) return
    const next: TaskStatus = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo"
    onStatusChange(task.id, next)
  }

  const dueStr = task.dueDate?.startsWith("SEED_")
    ? task.dueDate.replace("SEED_TODAY_", "Today ").replace("SEED_FRIDAY_", "Fri ")
    : task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : null

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative bg-white rounded-2xl border border-[#E5ECF4] shadow-[0_2px_8px_-4px_rgba(15,76,129,0.08)] hover:shadow-[0_8px_24px_-8px_rgba(15,76,129,0.16)] hover:border-[#C9DAEB] transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Color accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: color }} />

      <div className="pl-4 pr-4 pt-4 pb-3 ml-1">
        {/* Top row */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <button onClick={cycleStatus} className="shrink-0 mt-0.5 hover:scale-110 transition-transform" title="Cycle status">
            {task.status === "done" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : task.status === "in_progress" ? (
              <Clock className="h-4 w-4 text-blue-500" />
            ) : (
              <Circle className="h-4 w-4 text-[#CBD5E1]" />
            )}
          </button>
          <p className={`flex-1 text-sm font-bold leading-snug transition-colors ${task.status === "done" ? "line-through text-[#94A3B8]" : "text-[#0F1B2D] group-hover:text-[#0F4C81]"}`}>
            {task.title}
          </p>
          <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${PRIORITY_DOT[task.priority]}`} title={task.priority} />
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
            {cfg.label}
          </span>
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-semibold bg-[#EAF2FA] text-[#0F4C81] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        {pct !== null && (
          <div className="mb-2.5">
            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-0.5 font-numeric">{done}/{total} subtasks</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#F1F5F9]">
          {dueStr ? (
            <span className="text-[11px] font-semibold text-[#64748B]">Due {dueStr}</span>
          ) : (
            <span className="text-[11px] text-[#94A3B8] truncate max-w-[140px]">
              {task.activityLog.at(-1)?.message.slice(0, 36)}
            </span>
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            {showAssignee && (
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold shadow-sm"
                style={{ backgroundColor: color }}
                title={AGENT_NAMES[task.assigneeId]}
              >
                {AGENT_NAMES[task.assigneeId]?.charAt(0)}
              </div>
            )}
            <ArrowRight className="h-3.5 w-3.5 text-[#CBD5E1] group-hover:text-[#0F4C81] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  )
}
