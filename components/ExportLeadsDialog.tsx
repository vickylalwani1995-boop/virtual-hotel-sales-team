"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Cloud,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { exportLeadsAsCSV, exportLeadsAsExcel, downloadBlob, type Lead } from "@/lib/leads";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type Destination =
  | "csv"
  | "excel"
  | "google_sheets"
  | "inntelligent"
  | "hubspot"
  | "salesforce"
  | "pipedrive"
  | "zoho"
  | "mailchimp"
  | "activecampaign"
  | "klaviyo";

type ExportStage = "idle" | "preparing" | "connecting" | "sending" | "confirming" | "done" | "error";

interface DestinationOption {
  id: Destination;
  name: string;
  category: "spreadsheet" | "crm" | "email_marketing";
  icon: string;
  color: string;
  sponsored?: boolean;
}

const DESTINATIONS: DestinationOption[] = [
  // Spreadsheets
  { id: "csv", name: "CSV File", category: "spreadsheet", icon: "📄", color: "bg-gray-50 border-gray-200" },
  { id: "excel", name: "Microsoft Excel", category: "spreadsheet", icon: "📊", color: "bg-green-50 border-green-200" },
  { id: "google_sheets", name: "Google Sheets", category: "spreadsheet", icon: "📗", color: "bg-emerald-50 border-emerald-200" },
  // CRMs
  { id: "inntelligent", name: "Inntelligent CRM", category: "crm", icon: "🏨", color: "bg-blue-50 border-blue-200", sponsored: true },
  { id: "hubspot", name: "HubSpot", category: "crm", icon: "🟠", color: "bg-orange-50 border-orange-200" },
  { id: "salesforce", name: "Salesforce", category: "crm", icon: "☁️", color: "bg-sky-50 border-sky-200" },
  { id: "pipedrive", name: "Pipedrive", category: "crm", icon: "🟢", color: "bg-lime-50 border-lime-200" },
  { id: "zoho", name: "Zoho CRM", category: "crm", icon: "🔴", color: "bg-red-50 border-red-200" },
  // Email Marketing
  { id: "mailchimp", name: "Mailchimp", category: "email_marketing", icon: "🐵", color: "bg-yellow-50 border-yellow-200" },
  { id: "activecampaign", name: "ActiveCampaign", category: "email_marketing", icon: "💙", color: "bg-indigo-50 border-indigo-200" },
  { id: "klaviyo", name: "Klaviyo", category: "email_marketing", icon: "🟣", color: "bg-purple-50 border-purple-200" },
];

const STAGE_MESSAGES: Record<ExportStage, string> = {
  idle: "",
  preparing: "Preparing leads...",
  connecting: "Connecting to destination...",
  sending: "Sending leads...",
  confirming: "Confirming receipt...",
  done: "Export complete!",
  error: "Export failed",
};

/* ─── Component ──────────────────────────────────────────────────────────────── */

interface ExportLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  selectedIds?: Set<string>;
}

export function ExportLeadsDialog({ open, onClose, leads, selectedIds }: ExportLeadsDialogProps) {
  const [destination, setDestination] = useState<Destination>("csv");
  const [stage, setStage] = useState<ExportStage>("idle");
  const [funnelFilter, setFunnelFilter] = useState<"all" | "calculated" | "hustle">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "contacted" | "replied" | "qualified" | "closed">("all");
  const [mockUrl, setMockUrl] = useState("");

  useEffect(() => {
    if (open) {
      setStage("idle");
      setMockUrl("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && stage === "idle") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, stage]);

  const getFilteredLeads = useCallback((): Lead[] => {
    let items = selectedIds && selectedIds.size > 0
      ? leads.filter((l) => selectedIds.has(l.id))
      : leads;
    if (funnelFilter !== "all") items = items.filter((l) => l.funnel === funnelFilter);
    if (statusFilter !== "all") items = items.filter((l) => l.status === statusFilter);
    return items;
  }, [leads, selectedIds, funnelFilter, statusFilter]);

  const handleExport = useCallback(async () => {
    const items = getFilteredLeads();
    if (items.length === 0) {
      toast.error("No leads match the current filters.");
      return;
    }

    // Direct download for CSV/Excel
    if (destination === "csv") {
      const csv = exportLeadsAsCSV(items);
      downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `leads-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success(`Exported ${items.length} leads as CSV.`);
      onClose();
      return;
    }
    if (destination === "excel") {
      const blob = exportLeadsAsExcel(items);
      downloadBlob(blob, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${items.length} leads as Excel.`);
      onClose();
      return;
    }

    // Theatre flow for cloud destinations
    setStage("preparing");
    await sleep(800);
    setStage("connecting");
    await sleep(1200);
    setStage("sending");

    try {
      const res = await fetch("/api/export/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          leadCount: items.length,
          leadIds: items.map((l) => l.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");

      setStage("confirming");
      await sleep(600);
      setStage("done");

      if (data.url) setMockUrl(data.url);
      toast.success(`${items.length} leads exported to ${DESTINATIONS.find((d) => d.id === destination)?.name}`);
    } catch (e) {
      setStage("error");
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  }, [destination, getFilteredLeads, onClose]);

  if (!open) return null;

  const filteredCount = getFilteredLeads().length;
  const destInfo = DESTINATIONS.find((d) => d.id === destination);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget && stage === "idle") onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-[#E5ECF4]"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5ECF4] bg-white/95 backdrop-blur px-6 py-4 rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold text-mhsp-navy">Export Leads</h2>
              <p className="text-sm text-mhsp-muted mt-0.5">{filteredCount} leads ready to export</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F6FA] transition-colors" aria-label="Close">
              <X className="h-5 w-5 text-mhsp-muted" />
            </button>
          </div>

          {stage !== "idle" && stage !== "done" && stage !== "error" ? (
            /* Progress view */
            <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
              <Loader2 className="h-10 w-10 text-[#1B6EB7] animate-spin" />
              <p className="text-base font-semibold text-mhsp-navy">{STAGE_MESSAGES[stage]}</p>
              <p className="text-sm text-mhsp-muted">Mapping {filteredCount} leads to {destInfo?.name}...</p>
            </div>
          ) : stage === "done" ? (
            /* Success view */
            <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-lg font-bold text-mhsp-navy">Export Complete</p>
              <p className="text-sm text-mhsp-muted">{filteredCount} leads sent to {destInfo?.name}</p>
              {mockUrl && (
                <a
                  href={mockUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-[#EAF2FA] text-[#1B6EB7] text-sm font-semibold hover:bg-[#D6E3F0] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> Open in {destInfo?.name}
                </a>
              )}
              <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-xl bg-[#1B6EB7] text-white text-sm font-bold hover:bg-[#0F4C81] transition-colors">
                Done
              </button>
            </div>
          ) : (
            /* Selection view */
            <div className="p-6 space-y-6">
              {/* Destination Grid */}
              <div>
                <h3 className="text-sm font-bold text-mhsp-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" /> Spreadsheets
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {DESTINATIONS.filter((d) => d.category === "spreadsheet").map((d) => (
                    <DestCard key={d.id} dest={d} selected={destination === d.id} onSelect={() => setDestination(d.id)} />
                  ))}
                </div>

                <h3 className="text-sm font-bold text-mhsp-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Cloud className="h-4 w-4" /> CRM Systems
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {DESTINATIONS.filter((d) => d.category === "crm").map((d) => (
                    <DestCard key={d.id} dest={d} selected={destination === d.id} onSelect={() => setDestination(d.id)} />
                  ))}
                </div>

                <h3 className="text-sm font-bold text-mhsp-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Email Marketing
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {DESTINATIONS.filter((d) => d.category === "email_marketing").map((d) => (
                    <DestCard key={d.id} dest={d} selected={destination === d.id} onSelect={() => setDestination(d.id)} />
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 border-t border-[#E5ECF4] pt-4">
                <label className="text-xs font-bold text-mhsp-muted uppercase tracking-wider self-center">Filters:</label>
                <select
                  value={funnelFilter}
                  onChange={(e) => setFunnelFilter(e.target.value as typeof funnelFilter)}
                  className="rounded-lg border border-[#E5ECF4] px-3 py-1.5 text-sm bg-white text-mhsp-navy"
                >
                  <option value="all">All funnels</option>
                  <option value="calculated">Calculated</option>
                  <option value="hustle">Hustle</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="rounded-lg border border-[#E5ECF4] px-3 py-1.5 text-sm bg-white text-mhsp-navy"
                >
                  <option value="all">All statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="replied">Replied</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
                <span className="ml-auto text-sm text-mhsp-muted self-center">{filteredCount} leads</span>
              </div>

              {/* Export button */}
              <button
                onClick={handleExport}
                disabled={filteredCount === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors shadow-[0_8px_20px_-6px_rgba(27,110,183,0.4)]"
              >
                <Download className="h-4 w-4" />
                Export {filteredCount} leads to {destInfo?.name}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Destination Card ──────────────────────────────────────────────────────── */

function DestCard({ dest, selected, onSelect }: { dest: DestinationOption; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
        selected
          ? "border-[#1B6EB7] bg-[#EAF2FA] ring-2 ring-[#1B6EB7]/20"
          : `${dest.color} hover:border-[#C9DAEB]`
      }`}
    >
      {dest.sponsored && (
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#1B6EB7] text-white text-[9px] font-bold uppercase tracking-wider">
          Sponsor
        </span>
      )}
      <span className="text-lg">{dest.icon}</span>
      <span className="text-xs font-semibold text-mhsp-navy leading-tight">{dest.name}</span>
    </button>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
