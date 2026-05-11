"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Loader2 } from "lucide-react";
import { logActivity } from "@/lib/activity-log";
import { parseEmailFromMarkdown } from "@/lib/email-parser";
import { addNotification } from "@/lib/notifications";

export function EmailQueueModal({
  agentId,
  output,
}: {
  agentId: string;
  output: string;
}) {
  const initial = parseEmailFromMarkdown(output);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [recipient, setRecipient] = useState(initial.to === "client@example.com" ? "" : initial.to);
  const [submitting, setSubmitting] = useState(false);

  async function queue() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/queue-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          subject,
          body,
          recipientHint: recipient,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Queue failed");
      logActivity({
        type: "email_queued",
        agentId,
        subject: subject || "(no subject)",
        preview: body.slice(0, 100),
      });
      addNotification({
        type: "email",
        title: `Email queued${recipient ? ` for ${recipient}` : ""}`,
        description: subject || "(no subject)",
        agentId,
        actionUrl: "/activity",
      });
      toast.success("Email queued - will sync with MyHospitalitySalesPro");
      setOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to queue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-mhsp-line bg-white hover:border-mhsp-gold/60 hover:bg-mhsp-cream-warm/40 px-3 py-1.5 text-sm font-semibold text-mhsp-navy transition-all">
        <Mail className="h-3.5 w-3.5" /> Send Email
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-mhsp-navy">
            Queue email for sending
          </DialogTitle>
          <DialogDescription className="text-mhsp-muted">
            Review the draft. Once queued it will sync with MyHospitalitySalesPro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Recipient (optional hint)
            </label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. director.travel@acme.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Body</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-64 font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={queue}
            disabled={submitting || !body.trim()}
            className="bg-mhsp-gold hover:bg-mhsp-gold-soft text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Queueing…
              </>
            ) : (
              "Queue for sending"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
