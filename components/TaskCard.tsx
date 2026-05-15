"use client"

import { AGENT_COLORS, AGENT_NAMES, type Task, type TaskStatus } from "@/lib/tasks"
import { CheckCircle2, Circle, Clock } from "lucide-react"

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo:        "bg-gray-100 text-gray-600 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done:        "bg-green-50 text-green-700 border-green-200",
}

const PRIORITY_DOT: Record<string, string> = {
  high:   "bg-red-500",
  medium: "bg-yellow-400",
  low:    "bg-green-500",
}

interface TaskCardProps {
  task: Task
  showAssignee?: boolean
  onClick: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
}

export function TaskCard({ task, showAssignee, onClick, onStatusChange }: TaskCardProps) {
  const color = AGENT_COLORS[task.assigneeId] ?? "#0F4C81"
  const donePct = task.subtasks.length
    ? Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100)
    : null

  const dueTs = task.dueDate?.startsWith("SEED_")
    ? task.dueDate.replace("SEED_TODAY_", "Today ").replace("SEED_FRIDAY_", "Fri ")
    : task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : null

  function cycleStatus(e: React.MouseEvent) {
    e.stopPropagation()
    if (!onStatusChange) return
    const next: TaskStatus = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo"
    onStatusChange(task.id, next)
  }

  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-150 p-4 cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={cycleStatus}
          className="shrink-0 mt-0.5"
          title="Cycle status"
        >
          {task.status === "done" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : task.status === "in_progress" ? (
            <Clock className="h-4 w-4 text-blue-500" />
          ) : (
            <Circle className="h-4 w-4 text-[#CBD5E1]" />
          )}
        </button>
        <p className={`text-sm font-semibold text-[#0F1B2D] leading-snug flex-1 ${task.status === "done" ? "line-through text-[#9CA3AF]" : ""}`}>
          {task.title}
        </p>
        <span className={`shrink-0 h-2 w-2 rounded-full mt-1.5 ${PRIORITY_DOT[task.priority]}`} title={task.priority + " priority"} />
      </div>

      {/* Status pill */}
      <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${STATUS_COLORS[task.status]}`}>
        {STATUS_LABELS[task.status]}
      </span>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] bg-[#EAF2FA] text-[#0F4C81] px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {donePct !== null && (
        <div className="mt-2.5">
          <div className="h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, backgroundColor: color }} />
          </div>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">{donePct}% subtasks done</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F8FAFC] gap-2">
        {dueTs ? (
          <span className="text-[11px] text-[#9CA3AF]">Due {dueTs}</span>
        ) : (
          <span className="text-[11px] text-[#9CA3AF]">
            {task.activityLog.at(-1)?.message.slice(0, 30)}
          </span>
        )}
        {showAssignee && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
            style={{ backgroundColor: color }}
            title={AGENT_NAMES[task.assigneeId]}
          >
            {AGENT_NAMES[task.assigneeId]?.charAt(0)}
          </div>
        )}
      </div>
    </div>
  )
}
