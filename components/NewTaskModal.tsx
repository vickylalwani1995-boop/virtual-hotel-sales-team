"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { type Task, type TaskPriority, AGENT_NAMES } from "@/lib/tasks"

const AGENT_ORDER = [
  "01_director", "02_lead_gen", "03_outbound",
  "04_rfp_group", "05_retention", "06_revenue",
]

interface NewTaskModalProps {
  onClose: () => void
  onCreate: (task: Partial<Task>) => void
  defaultAssignee?: string
}

export function NewTaskModal({ onClose, onCreate, defaultAssignee }: NewTaskModalProps) {
  const [title, setTitle] = useState("")
  const [assigneeId, setAssigneeId] = useState(defaultAssignee ?? "01_director")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  function handleCreate() {
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      assigneeId,
      priority,
      description,
      dueDate: dueDate || undefined,
      tags,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F1B2D]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0F1B2D]">New Task</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A6B82] hover:bg-[#F4F8FC]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Title *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="text-sm border border-[#DCE5EF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/20 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="text-sm border border-[#DCE5EF] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#1B6EB7] transition"
              >
                {AGENT_ORDER.map((id) => (
                  <option key={id} value={id}>{AGENT_NAMES[id]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="text-sm border border-[#DCE5EF] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#1B6EB7] transition"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional context..."
              rows={2}
              className="text-sm border border-[#DCE5EF] rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/20 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-sm border border-[#DCE5EF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B6EB7] transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Type a tag, press Enter"
                className="flex-1 text-sm border border-[#DCE5EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6EB7] transition"
              />
              <button onClick={addTag} className="px-3 text-xs font-semibold text-[#0F4C81] border border-[#DCE5EF] rounded-lg hover:bg-[#EAF2FA] transition-colors">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-[#EAF2FA] text-[#0F4C81] px-2 py-0.5 rounded-md">
                    {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-[#9CA3AF] hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="w-full py-2.5 bg-[#0F4C81] hover:bg-[#1B6EB7] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  )
}
