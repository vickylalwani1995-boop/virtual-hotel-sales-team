"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react";
import {
  addEmail,
  updateEmailStatus,
  type WorkspaceEmail,
  type WorkspaceLead,
} from "@/lib/workspace";

interface EmailComposerProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill fields from a lead */
  lead?: WorkspaceLead | null;
  /** Pre-fill from AI-drafted content */
  prefill?: { to?: string; subject?: string; body?: string };
  /** Agent who is drafting */
  agentName: string;
  agentId: string;
}

type SendStage = "idle" | "validating" | "connecting" | "sending" | "delivered" | "error";

const SEND_STAGES: { key: SendStage; label: string; icon: typeof Loader2 }[] = [
  { key: "validating", label: "Validating recipient…", icon: Loader2 },
  { key: "connecting", label: "Connecting to mail server…", icon: Loader2 },
  { key: "sending", label: "Sending email…", icon: Loader2 },
  { key: "delivered", label: "Email delivered!", icon: CheckCircle2 },
];

export function EmailComposer({
  open,
  onClose,
  lead,
  prefill,
  agentName,
  agentId,
}: EmailComposerProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendStage, setSendStage] = useState<SendStage>("idle");
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Populate fields when lead or prefill changes
  useEffect(() => {
    if (!open) return;
    setTo(prefill?.to || lead?.email || "");
    setSubject(prefill?.subject || "");
    setBody(prefill?.body || "");
    setSendStage("idle");
    setScheduleLater(false);
    setScheduleDate("");
  }, [open, lead, prefill]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && sendStage === "idle") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, sendStage]);

  const handleSaveDraft = useCallback(() => {
    if (!to.trim() || !subject.trim()) {
      toast.error("Recipient and subject are required.");
      return;
    }
    addEmail(
      {
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        leadId: lead?.id,
        status: "draft",
        draftedBy: agentName,
      },
      agentName
    );
    toast.success("Email saved as draft.");
    onClose();
  }, [to, subject, body, lead, agentName, onClose]);

  const handleSend = useCallback(async () => {
    if (!to.trim() || !subject.trim()) {
      toast.error("Recipient and subject are required.");
      return;
    }

    // Save email first
    addEmail(
      {
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        leadId: lead?.id,
        status: "queued",
        draftedBy: agentName,
      },
      agentName
    );

    // Theatre send — simulate sending stages
    setSendStage("validating");
    await delay(800);
    setSendStage("connecting");
    await delay(1200);
    setSendStage("sending");

    try {
      const res = await fetch("/api/email-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          body: body.trim(),
          leadId: lead?.id,
          agentId,
          scheduledFor: scheduleLater ? scheduleDate : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Send failed" }));
        throw new Error(data.error || "Send failed");
      }

      setSendStage("delivered");
      toast.success(`Email sent to ${to.trim()}`);

      // Update lead's email campaign status
      if (lead?.id) {
        const { updateLead } = await import("@/lib/workspace");
        updateLead(lead.id, { emailCampaignStatus: "sent", status: lead.status === "new" ? "contacted" : lead.status });
      }

      await delay(1500);
      onClose();
    } catch (err) {
      setSendStage("error");
      toast.error(err instanceof Error ? err.message : "Send failed");
      await delay(2000);
      setSendStage("idle");
    }
  }, [to, subject, body, lead, agentName, agentId, scheduleLater, scheduleDate, onClose]);

  const currentStage = SEND_STAGES.find((s) => s.key === sendStage);
  const isBusy = sendStage !== "idle" && sendStage !== "error";

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
            onClick={() => !isBusy && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-x-4 top-[8vh] z-50 mx-auto max-w-2xl"
          >
            <div className="rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30)] overflow-hidden flex flex-col max-h-[84vh]">
              {/* Top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5ECF4]">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] flex items-center justify-center text-white shadow-sm">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-mhsp-navy leading-tight">
                      Compose Email
                    </h3>
                    <p className="text-[12px] text-mhsp-muted">
                      Drafted by {agentName}
                      {lead ? ` · for ${lead.fullName}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isBusy && onClose()}
                  disabled={isBusy}
                  className="p-1.5 rounded-md text-mhsp-muted hover:text-mhsp-navy hover:bg-[#F4F8FC] disabled:opacity-40 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Send progress overlay */}
              {isBusy && (
                <div className="px-5 py-3 bg-[#F4F8FC] border-b border-[#E5ECF4]">
                  <div className="flex items-center gap-3">
                    {sendStage === "delivered" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-[#1B6EB7] animate-spin" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-mhsp-navy">
                        {currentStage?.label || "Processing…"}
                      </p>
                      <div className="mt-1.5 h-1.5 w-full bg-[#E5ECF4] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#2F8FCC] to-[#1B6EB7] rounded-full"
                          initial={{ width: "0%" }}
                          animate={{
                            width:
                              sendStage === "validating"
                                ? "25%"
                                : sendStage === "connecting"
                                ? "50%"
                                : sendStage === "sending"
                                ? "75%"
                                : "100%",
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* To */}
                <div>
                  <label className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted block mb-1.5">
                    To
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mhsp-muted" />
                    <input
                      type="email"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      disabled={isBusy}
                      placeholder="recipient@company.com"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                  {lead && (
                    <p className="text-[11px] text-mhsp-muted mt-1">
                      {lead.fullName} · {lead.jobTitle} · {lead.companyName}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted block mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isBusy}
                    placeholder="Email subject line"
                    className="rounded-xl"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted block mb-1.5">
                    Body
                  </label>
                  <textarea
                    ref={bodyRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={isBusy}
                    rows={10}
                    placeholder="Write your email here…"
                    className="rounded-xl leading-relaxed resize-none"
                  />
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-mhsp-text cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={scheduleLater}
                      onChange={(e) => setScheduleLater(e.target.checked)}
                      disabled={isBusy}
                      className="h-4 w-4 rounded border-[#DCE5EF] text-[#1B6EB7]"
                    />
                    <Clock className="h-3.5 w-3.5 text-mhsp-muted" />
                    Schedule for later
                  </label>
                  {scheduleLater && (
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      disabled={isBusy}
                      className="flex-1 rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#E5ECF4] px-5 py-4 bg-[#FBFCFE] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isBusy}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Save as draft
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isBusy || !to.trim() || !subject.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-[0.1em] shadow-[0_8px_18px_-8px_rgba(27,110,183,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-4 w-4" />
                  {scheduleLater ? "Schedule" : "Send now"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
