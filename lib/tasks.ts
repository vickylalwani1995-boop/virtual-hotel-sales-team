import { nanoid } from "nanoid"

export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface TaskActivity {
  timestamp: string
  by: string
  message: string
}

export interface TaskComment {
  id: string
  by: string
  body: string
  timestamp: string
}

export interface Task {
  id: string
  title: string
  description: string
  assigneeId: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  linkedLeadIds: string[]
  subtasks: Subtask[]
  activityLog: TaskActivity[]
  comments: TaskComment[]
  createdAt: string
  dueDate?: string
  completedAt?: string
}

const TASKS_KEY = "vhst-tasks"
const COUNTER_KEY = "vhst-task-counter"

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

function nextCounter(): number {
  if (typeof window === "undefined") return 1
  const n = parseInt(localStorage.getItem(COUNTER_KEY) ?? "0", 10) + 1
  localStorage.setItem(COUNTER_KEY, String(n))
  return n
}

export function createTask(input: Partial<Task>): Task {
  const now = new Date().toISOString()
  const task: Task = {
    id: nanoid(),
    title: input.title ?? "Untitled Task",
    description: input.description ?? "",
    assigneeId: input.assigneeId ?? "01_director",
    status: input.status ?? "todo",
    priority: input.priority ?? "medium",
    tags: input.tags ?? [],
    linkedLeadIds: input.linkedLeadIds ?? [],
    subtasks: input.subtasks ?? [],
    activityLog: input.activityLog ?? [{ timestamp: now, by: "system", message: "Task created" }],
    comments: input.comments ?? [],
    createdAt: input.createdAt ?? now,
    dueDate: input.dueDate,
    completedAt: input.completedAt,
  }
  return task
}

export function getTasksByAgent(tasks: Task[], agentId: string): Task[] {
  return tasks.filter((t) => t.assigneeId === agentId)
}

export function getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status)
}

export function updateTaskStatus(tasks: Task[], taskId: string, status: TaskStatus): Task[] {
  const now = new Date().toISOString()
  return tasks.map((t) => {
    if (t.id !== taskId) return t
    return {
      ...t,
      status,
      completedAt: status === "done" ? now : t.completedAt,
      activityLog: [
        ...t.activityLog,
        { timestamp: now, by: "system", message: `Status changed to ${status.replace("_", " ")}` },
      ],
    }
  })
}

export function addTaskActivity(tasks: Task[], taskId: string, message: string, by: string): Task[] {
  const now = new Date().toISOString()
  return tasks.map((t) => {
    if (t.id !== taskId) return t
    return { ...t, activityLog: [...t.activityLog, { timestamp: now, by, message }] }
  })
}

export function addTaskComment(tasks: Task[], taskId: string, body: string, by: string): Task[] {
  const now = new Date().toISOString()
  return tasks.map((t) => {
    if (t.id !== taskId) return t
    return {
      ...t,
      comments: [...t.comments, { id: nanoid(), by, body, timestamp: now }],
    }
  })
}

export const AGENT_COLORS: Record<string, string> = {
  "01_director":  "#D4A537",
  "02_lead_gen":  "#3B82F6",
  "03_outbound":  "#10B981",
  "04_rfp_group": "#8B5CF6",
  "05_retention": "#F59E0B",
  "06_revenue":   "#EF4444",
}

export const AGENT_NAMES: Record<string, string> = {
  "01_director":  "Donna Marie",
  "02_lead_gen":  "Marcus Reed",
  "03_outbound":  "Sarah Chen",
  "04_rfp_group": "Priya Sharma",
  "05_retention": "Liam Chen",
  "06_revenue":   "Maya Reddy",
}

export const AGENT_ROLES: Record<string, string> = {
  "01_director":  "Director of Sales",
  "02_lead_gen":  "Lead Generation",
  "03_outbound":  "Outbound Sales",
  "04_rfp_group": "Group & RFP",
  "05_retention": "Customer Success",
  "06_revenue":   "Revenue Analytics",
}

export const AGENT_SLUGS: Record<string, string> = {
  donna:  "01_director",
  marcus: "02_lead_gen",
  sarah:  "03_outbound",
  priya:  "04_rfp_group",
  liam:   "05_retention",
  maya:   "06_revenue",
  captain: "01_director",
}

export const ALL_AGENT_IDS = Object.values(AGENT_SLUGS).filter((v, i, a) => a.indexOf(v) === i)
