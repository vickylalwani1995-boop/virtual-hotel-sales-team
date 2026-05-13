"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addLeads } from "@/lib/leads";
import {
  hasLeadTable,
  parseLeadsFromMarkdown,
} from "@/lib/parse-leads-from-markdown";
import { addNotification } from "@/lib/notifications";

/**
 * Renders below a Lead Generation agent's reply when the reply
 * contains a markdown table of leads. Lets the user save those
 * leads to the Lead Manager in one click.
 */
export function LeadCaptureBar({
  content,
  agentId,
  hotelProfile = "",
}: {
  content: string;
  agentId: string;
  hotelProfile?: string;
}) {
  const isLeadGenAgent = agentId === "02_lead_gen";

  const parsed = useMemo(
    () => (isLeadGenAgent && hasLeadTable(content) ? parseLeadsFromMarkdown(content) : []),
    [content, isLeadGenAgent],
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isLeadGenAgent) return null;
  if (parsed.length === 0) return null;

  async function handleSave() {
    setSaving(true);
    try {
      addLeads(
        parsed.map((l) => ({
          ...l,
          source: "agent_generated",
          funnel: "hustle",
          agentId,
          hotelProfile,
        })),
      );
      addNotification({
        type: "lead",
        title: `${parsed.length} ${parsed.length === 1 ? "lead" : "leads"} captured`,
        description: "Saved to Lead Manager from chat output.",
        agentId,
        actionUrl: "/leads",
      });
      setSaved(true);
      toast.success(
        `${parsed.length} ${parsed.length === 1 ? "lead" : "leads"} added to Lead Manager.`,
      );
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="mt-3 pt-3 border-t border-mhsp-line/70 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mhsp-success/10 border border-mhsp-success/30 text-mhsp-success px-2.5 py-1 text-sm font-bold uppercase tracking-[0.12em]">
          <Check className="h-3 w-3" strokeWidth={3} />
          {parsed.length} saved
        </span>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.12em] text-[#1B6EB7] hover:text-[#0F4C81] transition-colors group"
        >
          View in Lead Manager
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-mhsp-line/70 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="group inline-flex items-center gap-2 rounded-lg bg-[#1B6EB7] hover:bg-[#0F4C81] disabled:opacity-60 disabled:cursor-not-allowed text-white px-3.5 py-2 text-sm font-bold uppercase tracking-[0.12em] shadow-[0_6px_18px_-6px_rgba(27,110,183,0.5)] hover:-translate-y-0.5 transition-all"
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        Save {parsed.length} {parsed.length === 1 ? "lead" : "leads"} to Lead Manager
      </button>
      <span className="text-sm text-mhsp-muted">
        Parses the table above into 21-column lead records.
      </span>
    </div>
  );
}
