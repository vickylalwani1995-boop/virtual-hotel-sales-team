"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  Plus,
  Trash2,
  Mail,
  Phone,
  Link2,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  GripVertical,
} from "lucide-react";
import {
  addSequence,
  getAllLeads,
  type WorkspaceLead,
  type SequenceStep,
} from "@/lib/workspace";

interface SequenceBuilderProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selected lead IDs */
  preSelectedLeadIds?: string[];
  agentName: string;
}

const STEP_TEMPLATES: Record<string, SequenceStep[]> = {
  "cold-outreach": [
    { day: 1, subject: "Introduction — {{hotel}} × {{company}}", body: "Hi {{firstName}},\n\nI'm reaching out because...", type: "email" },
    { day: 3, subject: "", body: "Follow-up call to introduce our property", type: "call" },
    { day: 5, subject: "Quick follow-up — {{hotel}} partnership", body: "Hi {{firstName}},\n\nJust following up on my previous email...", type: "email" },
    { day: 8, subject: "", body: "Connect on LinkedIn with personalized note", type: "linkedin" },
    { day: 12, subject: "Last touch — special rates for {{company}}", body: "Hi {{firstName}},\n\nI wanted to share one more thing...", type: "email" },
  ],
  "warm-follow-up": [
    { day: 1, subject: "Great meeting you — next steps", body: "Hi {{firstName}},\n\nThank you for our conversation...", type: "email" },
    { day: 3, subject: "Proposal attached — {{hotel}} × {{company}}", body: "Hi {{firstName}},\n\nAs promised, here's our proposal...", type: "email" },
    { day: 7, subject: "", body: "Follow-up call to discuss proposal", type: "call" },
    { day: 10, subject: "Checking in — {{company}} partnership", body: "Hi {{firstName}},\n\nWanted to check if you had a chance to review...", type: "email" },
    { day: 14, subject: "Final follow-up — {{company}} rates", body: "Hi {{firstName}},\n\nI know you're busy. Just wanted to...", type: "email" },
  ],
  blank: [],
};

const STEP_ICONS: Record<SequenceStep["type"], typeof Mail> = {
  email: Mail,
  call: Phone,
  linkedin: Link2,
};

const STEP_COLORS: Record<SequenceStep["type"], string> = {
  email: "bg-[#EAF2FA] text-[#1B6EB7] border-[#C9DAEB]",
  call: "bg-emerald-50 text-emerald-700 border-emerald-200",
  linkedin: "bg-blue-50 text-blue-700 border-blue-200",
};

export function SequenceBuilder({
  open,
  onClose,
  preSelectedLeadIds,
  agentName,
}: SequenceBuilderProps) {
  const [name, setName] = useState("New Outreach Sequence");
  const [steps, setSteps] = useState<SequenceStep[]>([...STEP_TEMPLATES["cold-outreach"]]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set(preSelectedLeadIds || []));
  const [allLeads, setAllLeads] = useState<WorkspaceLead[]>([]);
  const [platform, setPlatform] = useState("built-in");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAllLeads(getAllLeads());
      if (preSelectedLeadIds) {
        setSelectedLeadIds(new Set(preSelectedLeadIds));
      }
    }
  }, [open, preSelectedLeadIds]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleApplyTemplate = useCallback((key: string) => {
    const template = STEP_TEMPLATES[key];
    if (template) {
      setSteps([...template]);
      toast.success(`Applied "${key}" template`);
    }
  }, []);

  const handleAddStep = useCallback(() => {
    const lastDay = steps.length > 0 ? steps[steps.length - 1].day : 0;
    setSteps((prev) => [
      ...prev,
      { day: lastDay + 3, subject: "", body: "", type: "email" },
    ]);
  }, [steps]);

  const handleRemoveStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdateStep = useCallback(
    (index: number, updates: Partial<SequenceStep>) => {
      setSteps((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const toggleLead = useCallback((id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Demo override: all campaign emails go to this address
  const DEMO_RECIPIENT = "vicky.lalwani@softqubes.com";

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Sequence name is required.");
      return;
    }
    if (steps.length === 0) {
      toast.error("Add at least one step.");
      return;
    }

    setSaving(true);

    // Get selected leads (or use demo fallback)
    const recipientIds = Array.from(selectedLeadIds);
    const recipientLeads = allLeads.filter((l) => recipientIds.includes(l.id));

    // Send all email-type steps via the email-send API
    const emailSteps = steps.filter((s) => s.type === "email");
    let sentCount = 0;
    let failCount = 0;

    for (const step of emailSteps) {
      try {
        // Replace template variables with first lead info or defaults
        const lead = recipientLeads[0];
        const subject = step.subject
          .replace(/\{\{firstName\}\}/g, lead?.firstName || "there")
          .replace(/\{\{company\}\}/g, lead?.companyName || "your company")
          .replace(/\{\{hotel\}\}/g, "The Westmore Hotel Dallas");
        const body = step.body
          .replace(/\{\{firstName\}\}/g, lead?.firstName || "there")
          .replace(/\{\{company\}\}/g, lead?.companyName || "your company")
          .replace(/\{\{hotel\}\}/g, "The Westmore Hotel Dallas");

        const res = await fetch("/api/email-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: DEMO_RECIPIENT,
            subject: `[Campaign: ${name.trim()}] ${subject}`,
            body,
            agentId: agentName,
          }),
        });
        const result = await res.json();
        if (result.success) {
          sentCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    addSequence(
      {
        name: name.trim(),
        recipientLeadIds: recipientIds.length > 0 ? recipientIds : ["demo"],
        steps,
        status: "scheduled",
        platform,
      },
      agentName
    );

    if (sentCount > 0) {
      toast.success(`Sequence "${name.trim()}" created! ${sentCount} email(s) sent to ${DEMO_RECIPIENT}.`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} email(s) failed to send.`);
    }
    if (emailSteps.length === 0) {
      toast.success(`Sequence "${name.trim()}" created with ${steps.length} steps.`);
    }
    setSaving(false);
    onClose();
  }, [name, steps, selectedLeadIds, allLeads, platform, agentName, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-[#0F1B2D]/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-x-4 top-[4vh] z-50 mx-auto max-w-3xl"
          >
            <div className="rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30)] overflow-hidden flex flex-col max-h-[92vh]">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-[#1B6EB7] to-[#0F4C81]" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5ECF4]">
                <div>
                  <p className="text-sm font-bold tracking-[0.16em] uppercase text-mhsp-gold">
                    Drip Campaign
                  </p>
                  <h3 className="font-heading text-lg font-bold text-mhsp-navy mt-0.5">
                    Sequence Builder
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-md text-mhsp-muted hover:text-mhsp-navy hover:bg-[#F4F8FC] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Name + Template */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted block mb-1.5">
                      Sequence name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted block mb-1.5">
                      Template
                    </label>
                    <select
                      onChange={(e) => handleApplyTemplate(e.target.value)}
                      defaultValue=""
                      className="rounded-xl"
                    >
                      <option value="" disabled>
                        Apply template…
                      </option>
                      <option value="cold-outreach">Cold outreach (5 steps)</option>
                      <option value="warm-follow-up">Warm follow-up (5 steps)</option>
                      <option value="blank">Blank</option>
                    </select>
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted block mb-1.5">
                    Send via
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "built-in", label: "Built-in (Theatre)" },
                      { value: "mailchimp", label: "Mailchimp" },
                      { value: "sendgrid", label: "SendGrid" },
                      { value: "softqube", label: "SoftQube" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPlatform(opt.value)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                          platform === opt.value
                            ? "bg-[#1B6EB7] text-white border-[#1B6EB7]"
                            : "bg-white text-mhsp-navy border-[#DCE5EF] hover:border-[#1B6EB7]/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {platform !== "built-in" && (
                    <p className="text-[11px] text-mhsp-muted mt-1">
                      {platform} integration coming soon — will use theatre mode for now.
                    </p>
                  )}
                </div>

                {/* Steps */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted">
                      Steps ({steps.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#1B6EB7] hover:text-[#0F4C81] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add step
                    </button>
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, i) => {
                      const StepIcon = STEP_ICONS[step.type];
                      return (
                        <div
                          key={i}
                          className={`rounded-xl border p-3 ${STEP_COLORS[step.type]}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <GripVertical className="h-3.5 w-3.5 opacity-40 cursor-grab" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">
                              Step {i + 1}
                            </span>
                            <div className="flex items-center gap-1 ml-auto">
                              <span className="text-[11px] font-semibold">Day</span>
                              <input
                                type="number"
                                value={step.day}
                                min={1}
                                onChange={(e) =>
                                  handleUpdateStep(i, {
                                    day: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-12 px-1.5 py-0.5 rounded border border-current/20 bg-white/60 text-sm text-center"
                              />
                            </div>
                            <select
                              value={step.type}
                              onChange={(e) =>
                                handleUpdateStep(i, {
                                  type: e.target.value as SequenceStep["type"],
                                })
                              }
                              className="appearance-none px-2 py-0.5 rounded border border-current/20 bg-white/60 text-sm font-semibold"
                            >
                              <option value="email">Email</option>
                              <option value="call">Call</option>
                              <option value="linkedin">LinkedIn</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(i)}
                              className="p-0.5 rounded hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {step.type === "email" && (
                            <div className="space-y-1.5 pl-5">
                              <input
                                type="text"
                                value={step.subject}
                                onChange={(e) =>
                                  handleUpdateStep(i, { subject: e.target.value })
                                }
                                placeholder="Subject line (use {{firstName}}, {{company}}, {{hotel}})"
                                className="w-full px-2.5 py-1.5 rounded border border-current/15 bg-white/80 text-sm placeholder:opacity-50 focus:outline-none"
                              />
                              <textarea
                                value={step.body}
                                onChange={(e) =>
                                  handleUpdateStep(i, { body: e.target.value })
                                }
                                rows={3}
                                placeholder="Email body…"
                                className="w-full px-2.5 py-1.5 rounded border border-current/15 bg-white/80 text-sm leading-relaxed placeholder:opacity-50 resize-none focus:outline-none"
                              />
                            </div>
                          )}
                          {step.type !== "email" && (
                            <div className="pl-5">
                              <input
                                type="text"
                                value={step.body}
                                onChange={(e) =>
                                  handleUpdateStep(i, { body: e.target.value })
                                }
                                placeholder={
                                  step.type === "call"
                                    ? "Call script / talking points"
                                    : "LinkedIn message / connection note"
                                }
                                className="w-full px-2.5 py-1.5 rounded border border-current/15 bg-white/80 text-sm placeholder:opacity-50 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {steps.length === 0 && (
                      <div className="rounded-xl border border-dashed border-[#DCE5EF] p-6 text-center">
                        <p className="text-sm text-mhsp-muted">
                          No steps yet. Add one or apply a template above.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <h4 className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted mb-2">
                    Recipients ({selectedLeadIds.size} selected)
                  </h4>
                  {allLeads.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#DCE5EF] p-6 text-center">
                      <p className="text-sm text-mhsp-muted">
                        No leads in workspace. Generate leads first.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[200px] overflow-y-auto rounded-xl border border-[#E5ECF4] divide-y divide-[#F1F4F8]">
                      {allLeads.map((lead) => (
                        <label
                          key={lead.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.has(lead.id)}
                            onChange={() => toggleLead(lead.id)}
                            className="h-4 w-4 rounded border-[#DCE5EF] text-[#1B6EB7]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-mhsp-navy truncate">
                              {lead.fullName || "Unnamed"}
                            </p>
                            <p className="text-[11px] text-mhsp-muted truncate">
                              {lead.jobTitle} · {lead.companyName}
                              {lead.email ? ` · ${lead.email}` : ""}
                            </p>
                          </div>
                          {lead.emailCampaignStatus !== "not_emailed" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E]">
                              {lead.emailCampaignStatus}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                  {allLeads.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLeadIds(new Set(allLeads.map((l) => l.id)))}
                        className="text-[11px] font-semibold text-[#1B6EB7] hover:underline"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLeadIds(new Set())}
                        className="text-[11px] font-semibold text-mhsp-muted hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#E5ECF4] px-5 py-4 bg-[#FBFCFE] flex items-center justify-between gap-3">
                <p className="text-[12px] text-mhsp-muted">
                  {steps.length} steps · {selectedLeadIds.size} recipients
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-4 py-2.5 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-sm font-bold uppercase tracking-[0.1em] shadow-[0_8px_18px_-8px_rgba(16,185,129,0.5)] disabled:opacity-40 transition-all"
                  >
                    {saving ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {saving ? "Creating…" : "Create sequence"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
