"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  Crown,
  Search,
  Send,
  FileText,
  Heart,
  BarChart3,
  Sparkles,
  Download,
  Copy,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import {
  type Playbook,
  type PlaybookMetadata,
  getCustomPlaybooks,
  deleteCustomPlaybook,
  importPlaybook,
  parsePlaybook,
  isDefaultPlaybook,
} from "@/lib/playbooks";

// ─── Icon mapping ────────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "01_donna_marie": Crown,
  "02_marcus_reed": Search,
  "03_sarah_chen": Send,
  "04_priya_sharma": FileText,
  "05_liam_chen": Heart,
  "06_maya_reddy": BarChart3,
};

function getIcon(id: string) {
  return AGENT_ICONS[id] || Sparkles;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = "all" | "custom" | "templates";

// ─── Templates (preview data) ────────────────────────────────────────────────

const TEMPLATE_PREVIEWS = [
  { id: "spa_membership_closer", name: "Spa Membership Closer", desc: "Converts day-spa visitors into annual membership holders", vertical: "Spa & Wellness" },
  { id: "restaurant_catering_mgr", name: "Restaurant Catering Manager", desc: "Manages event catering inquiries and proposals", vertical: "F&B" },
  { id: "event_planner", name: "Event Planner Specialist", desc: "Coordinates conferences, weddings, and social events", vertical: "Events" },
  { id: "dental_treatment_coord", name: "Dental Treatment Coordinator", desc: "Qualifies patient inquiries and schedules high-value treatments", vertical: "Healthcare" },
  { id: "saas_demo_qualifier", name: "SaaS Demo Qualifier", desc: "Qualifies inbound demo requests and routes to AEs", vertical: "SaaS" },
  { id: "real_estate_listing", name: "Real Estate Listing Specialist", desc: "Nurtures buyer leads and schedules property showings", vertical: "Real Estate" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PlaybookStudioPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [defaultPlaybooks, setDefaultPlaybooks] = useState<Playbook[]>([]);
  const [customPlaybooks, setCustomPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/playbooks");
        const data = await res.json();
        if (data.success) setDefaultPlaybooks(data.playbooks);
      } catch { /* fallback empty */ }
      setCustomPlaybooks(getCustomPlaybooks());
      setLoading(false);
    }
    load();
  }, []);

  const allPlaybooks = [...defaultPlaybooks, ...customPlaybooks];
  const activeCount = allPlaybooks.filter((p) => p.metadata.status === "active").length;

  function handleDelete(agentId: string) {
    if (!confirm("Delete this custom agent? This cannot be undone.")) return;
    deleteCustomPlaybook(agentId);
    setCustomPlaybooks(getCustomPlaybooks());
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.playbook,.txt";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const result = importPlaybook(text);
      if (result.success && result.playbook) {
        // Save and refresh
        const { saveCustomPlaybook } = await import("@/lib/playbooks");
        saveCustomPlaybook(result.playbook);
        setCustomPlaybooks(getCustomPlaybooks());
        alert(`Imported "${result.playbook.metadata.realName}" successfully!`);
      } else {
        alert(`Import failed:\n${result.errors?.join("\n")}`);
      }
    };
    input.click();
  }

  function handleDownload(playbook: Playbook) {
    const content = playbook.content;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playbook.metadata.agentId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const displayed =
    tab === "custom" ? customPlaybooks : tab === "all" ? allPlaybooks : [];

  return (
    <main className="min-h-[80vh]">
      <section className="relative overflow-hidden border-b border-[#E5ECF4]">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 500px at 50% 0%, rgba(15,76,129,0.04), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F2547]">
              Playbook Studio
            </h1>
            <p className="mt-1 text-[#6B7B8F] text-sm sm:text-base">
              Your AI sales team — managed your way
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-2 rounded-xl border border-[#1B6EB7]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F4C81] hover:bg-[#F0F5FB] transition-colors"
            >
              <Upload className="h-4 w-4" /> Import Playbook
            </button>
            <button
              onClick={() => router.push("/playbooks/new/edit")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C81] hover:bg-[#1B6EB7] text-white px-4 py-2.5 text-sm font-bold shadow-[0_4px_12px_-4px_rgba(15,76,129,0.5)] transition-all"
            >
              <Plus className="h-4 w-4" /> Create New Agent
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-sm text-[#6B7B8F] font-medium mb-6">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-[#1B6EB7]" />
            {defaultPlaybooks.length} Official Agents
          </span>
          <span className="text-[#1B6EB7]/30">·</span>
          <span>{customPlaybooks.length} Custom</span>
          <span className="text-[#1B6EB7]/30">·</span>
          <span>{activeCount} Active</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#E2E8F0] mb-6">
          {([
            ["all", `Active Agents (${allPlaybooks.length})`],
            ["custom", "My Custom Agents"],
            ["templates", "Templates"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === key
                  ? "text-[#0F4C81]"
                  : "text-[#6B7B8F] hover:text-[#0F4C81]"
              }`}
            >
              {label}
              {tab === key && (
                <motion.div
                  layoutId="playbook-tab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0F4C81]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Templates Tab */}
        {tab === "templates" && !loading && (
          <div>
            <div className="rounded-xl bg-gradient-to-r from-[#0F4C81]/5 to-[#1B6EB7]/10 border border-[#1B6EB7]/20 p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-[#1B6EB7]" />
                <span className="text-sm font-bold text-[#0F4C81]">Template Library</span>
              </div>
              <p className="text-sm text-[#6B7B8F]">
                Fork a pre-built playbook for your vertical. Customize it, publish it, and your agent is live.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATE_PREVIEWS.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl bg-white border border-[#E2E8F0] hover:border-[#1B6EB7]/30 hover:shadow-md p-5 transition-all cursor-pointer"
                  onClick={() => router.push(`/playbooks/${t.id}/edit?template=true`)}
                >
                  <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase text-[#1B6EB7] bg-[#0F4C81]/10 rounded-full px-2.5 py-1 mb-3">
                    {t.vertical}
                  </span>
                  <h3 className="font-heading font-bold text-[#0F2547] text-lg leading-tight">
                    {t.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#6B7B8F] leading-relaxed">
                    {t.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B6EB7]">
                    Fork Template →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Grid */}
        {tab !== "templates" && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((pb) => {
              const Icon = getIcon(pb.metadata.agentId);
              const isOfficial = isDefaultPlaybook(pb.metadata.agentId);
              return (
                <motion.div
                  key={pb.metadata.agentId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative rounded-xl bg-white border border-[#E2E8F0]
                             hover:border-[#1B6EB7]/30 hover:shadow-lg
                             p-5 sm:p-6 transition-all"
                >
                  {/* Badge */}
                  <span
                    className={`absolute top-4 right-4 text-[9px] font-bold tracking-[0.18em] uppercase rounded-full px-2.5 py-1 ${
                      isOfficial
                        ? "bg-[#0F4C81]/10 text-[#0F4C81]"
                        : "bg-[#0F4C81]/15 text-[#1B6EB7]"
                    }`}
                  >
                    {isOfficial ? "Official" : "Custom"}
                  </span>

                  {/* Icon + Status */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#F0F5FB]">
                      <Icon className="h-5 w-5 text-[#1B6EB7]" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        pb.metadata.status === "active"
                          ? "text-emerald-600"
                          : pb.metadata.status === "draft"
                            ? "text-amber-500"
                            : "text-gray-400"
                      }`}
                    >
                      {pb.metadata.status}
                    </span>
                  </div>

                  {/* Name + Designation */}
                  <h3 className="font-heading font-bold text-[#0F2547] text-lg leading-tight">
                    {pb.metadata.realName}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#1B6EB7]">
                    {pb.metadata.designation}
                  </p>

                  {/* Funnel */}
                  <p className="mt-2 text-xs text-[#6B7B8F]">
                    {pb.metadata.funnel === "calculated"
                      ? "Calculated Funnel"
                      : pb.metadata.funnel === "hustle"
                        ? "Hustle Funnel"
                        : "Custom Funnel"}
                    {pb.metadata.isCaptain && " · Captain"}
                  </p>

                  {/* Capabilities preview */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(pb.metadata.capabilities || []).slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-medium bg-[#F0F5FB] text-[#0F4C81]/70 rounded-full px-2 py-0.5"
                      >
                        {cap.replace(/_/g, " ")}
                      </span>
                    ))}
                    {(pb.metadata.capabilities?.length || 0) > 3 && (
                      <span className="text-[10px] font-medium text-[#6B7B8F]">
                        +{pb.metadata.capabilities!.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(`/playbooks/${pb.metadata.agentId}/edit`)
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C81] hover:text-[#1B6EB7] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {isOfficial ? "View" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDownload(pb)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7B8F] hover:text-[#0F4C81] transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                    {!isOfficial && (
                      <>
                        <button
                          onClick={() => {
                            const { duplicatePlaybook } = require("@/lib/playbooks");
                            const newName = prompt("New agent name:");
                            if (newName) {
                              duplicatePlaybook(pb, newName);
                              setCustomPlaybooks(getCustomPlaybooks());
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7B8F] hover:text-[#0F4C81] transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" /> Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(pb.metadata.agentId)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state for custom tab */}
        {tab === "custom" && customPlaybooks.length === 0 && !loading && (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-[#1B6EB7]/20 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-[#0F2547] text-lg mb-2">
              No custom agents yet
            </h3>
            <p className="text-sm text-[#6B7B8F] mb-6 max-w-md mx-auto">
              Create your first custom agent or import a .md playbook file to get started.
            </p>
            <button
              onClick={() => router.push("/playbooks/new/edit")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C81] hover:bg-[#1B6EB7] text-white px-5 py-2.5 text-sm font-bold transition-all"
            >
              <Plus className="h-4 w-4" /> Create New Agent
            </button>
          </div>
        )}
        </div>
      </section>
    </main>
  );
}
