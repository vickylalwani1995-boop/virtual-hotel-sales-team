"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { type Task, type TaskPriority, AGENT_NAMES, AGENT_COLORS } from "@/lib/tasks"

const AGENT_ORDER = ["01_director","02_lead_gen","03_outbound","04_rfp_group","05_retention","06_revenue"]

interface NewTaskModalProps {
  onClose: () => void
  onCreate: (task: Partial<Task>) => void
  defaultAssignee?: string
}

export function NewTaskModal({ onClose, onCreate, defaultAssignee }: NewTaskModalProps) {
  const [title,      setTitle]      = useState("")
  const [assigneeId, setAssigneeId] = useState(defaultAssignee ?? "01_director")
  const [priority,   setPriority]   = useState<TaskPriority>("medium")
  const [description,setDescription]= useState("")
  const [dueDate,    setDueDate]    = useState("")
  const [tagInput,   setTagInput]   = useState("")
  const [tags,       setTags]       = useState<string[]>([])

  const color = AGENT_COLORS[assigneeId] ?? "#0F4C81"

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  function handleCreate() {
    if (!title.trim()) return
    onCreate({ title: title.trim(), assigneeId, priority, description, dueDate: dueDate || undefined, tags })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F1B2D]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_32px_80px_-16px_rgba(15,76,129,0.28)] w-full max-w-md z-10 overflow-hidden">

        {/* Header band */}
        <div className="px-6 py-5 border-b border-[#E5ECF4] bg-gradient-to-r from-[#F4F8FC] to-white flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[#0F1B2D]">New Task</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Assign work to your sales team</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F4C81] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-sm font-medium border border-[#DCE5EF] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/15 transition-all placeholder:text-[#94A3B8]"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">Assign To</label>
            <div className="grid grid-cols-3 gap-1.5">
              {AGENT_ORDER.map(id => {
                const c = AGENT_COLORS[id] ?? "#0F4C81"
                const selected = assigneeId === id
                return (
                  <button
                    key={id}
                    onClick={() => setAssigneeId(id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                      selected
                        ? "border-transparent text-white shadow-sm"
                        : "border-[#E5ECF4] text-[#64748B] hover:border-[#C9DAEB] bg-white"
                    }`}
                    style={selected ? { backgroundColor: c } : {}}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${selected ? "bg-white/30" : ""}`}
                      style={!selected ? { backgroundColor: c } : {}}
                    >
                      {AGENT_NAMES[id]?.charAt(0)}
                    </div>
                    <span className="truncate">{AGENT_NAMES[id]?.split(" ")[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full text-sm font-semibold border border-[#DCE5EF] rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-[#1B6EB7] transition-all"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-sm font-semibold border border-[#DCE5EF] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#1B6EB7] transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Additional context…"
              rows={2}
              className="w-full text-sm border border-[#DCE5EF] rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/15 transition-all placeholder:text-[#94A3B8]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Type tag, press Enter"
                className="flex-1 text-sm border border-[#DCE5EF] rounded-xl px-3 py-2 focus:outline-none focus:border-[#1B6EB7] transition-all placeholder:text-[#94A3B8]"
              />
              <button onClick={addTag} className="px-3 py-2 text-xs font-bold text-[#0F4C81] border border-[#DCE5EF] hover:bg-[#EAF2FA] hover:border-[#1B6EB7] rounded-xl transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EAF2FA] text-[#0F4C81] border border-[#C9DAEB] px-2.5 py-1 rounded-full">
                    {tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-[#94A3B8] hover:text-red-500 leading-none ml-0.5 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="w-full py-3 bg-gradient-to-br from-[#1E5896] to-[#0F4C81] hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all shadow-[0_6px_20px_-6px_rgba(15,76,129,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  )
}
