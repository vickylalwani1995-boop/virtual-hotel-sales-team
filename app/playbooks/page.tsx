"use client";

import { useEffect, useState, useCallback } from "react";
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
  Eye,
  MessageSquare,
  GitFork,
  Trash2,
  BookOpen,
} from "lucide-react";
import {
  type Playbook,
  getCustomPlaybooks,
  deleteCustomPlaybook,
  importPlaybook,
  saveCustomPlaybook,
  isDefaultPlaybook,
  PLAYBOOK_TO_AGENT,
} from "@/lib/playbooks";
import { PlaybookViewerModal } from "@/components/PlaybookViewerModal";

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

type Tab = "active" | "custom" | "templates";

// ─── Templates (preview data) ────────────────────────────────────────────────

const TEMPLATE_IDS = [
  "spa_membership_closer",
  "restaurant_catering_mgr",
  "event_planner",
  "dental_treatment_coord",
  "saas_demo_qualifier",
  "real_estate_listing",
];

const TEMPLATE_META: Record<string, { name: string; desc: string; vertical: string }> = {
  spa_membership_closer: { name: "Spa Membership Closer", desc: "Converts day-spa visitors into annual membership holders", vertical: "Spa & Wellness" },
  restaurant_catering_mgr: { name: "Restaurant Catering Manager", desc: "Manages event catering inquiries and proposals", vertical: "F&B" },
  event_planner: { name: "Event Planner Specialist", desc: "Coordinates conferences, weddings, and social events", vertical: "Events" },
  dental_treatment_coord: { name: "Dental Treatment Coordinator", desc: "Qualifies patient inquiries and schedules high-value treatments", vertical: "Healthcare" },
  saas_demo_qualifier: { name: "SaaS Demo Qualifier", desc: "Qualifies inbound demo requests and routes to AEs", vertical: "SaaS" },
  real_estate_listing: { name: "Real Estate Listing Specialist", desc: "Nurtures buyer leads and schedules property showings", vertical: "Real Estate" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PlaybookStudioPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");
  const [defaultPlaybooks, setDefaultPlaybooks] = useState<Playbook[]>([]);
  const [templatePlaybooks, setTemplatePlaybooks] = useState<Playbook[]>([]);
  const [customPlaybooks, setCustomPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerPlaybook, setViewerPlaybook] = useState<Playbook | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/playbooks");
        const data = await res.json();
        if (data.success) setDefaultPlaybooks(data.playbooks);
      } catch { /* fallback empty */ }

      try {
        const templates: Playbook[] = [];
        for (const id of TEMPLATE_IDS) {
          const res = await fetch(`/api/playbooks?id=templates/${id}`);
          const data = await res.json();
          if (data.success && data.playbook) templates.push(data.playbook);
        }
        setTemplatePlaybooks(templates);
      } catch { /* fallback empty */ }

      setCustomPlaybooks(getCustomPlaybooks());
      setLoading(false);
    }
    load();
  }, []);

  const activePlaybooks = [...defaultPlaybooks, ...customPlaybooks.filter(p => p.metadata.status === "active")];
  const activeCount = activePlaybooks.length;

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
        saveCustomPlaybook(result.playbook);
        setCustomPlaybooks(getCustomPlaybooks());
        setTab("custom");
        alert(`Imported "${result.playbook.metadata.realName}" successfully!`);
      } else {
        alert(`Import failed:\n${result.errors?.join("\n")}`);
      }
    };
    input.click();
  }

  function handleDownload(playbook: Playbook) {
    const blob = new Blob([playbook.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playbook.metadata.agentId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleTestInChat(playbook: Playbook) {
    const agentId = PLAYBOOK_TO_AGENT[playbook.metadata.agentId] || playbook.metadata.agentId;
    router.push(`/agent/${agentId}`);
  }

  const handleFork = useCallback((playbook: Playbook) => {
    const newId = `custom_${Date.now()}`;
    const forked: Playbook = {
      ...playbook,
      metadata: {
        ...playbook.metadata,
        agentId: newId,
        realName: `${playbook.metadata.realName} (Fork)`,
        isCustom: true,
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0],
        createdBy: "user",
      },
      content: playbook.content
        .replace(playbook.metadata.agentId, newId)
        .replace(playbook.metadata.realName, `${playbook.metadata.realName} (Fork)`),
    };
    saveCustomPlaybook(forked);
    setCustomPlaybooks(getCustomPlaybooks());
    setTab("custom");
    alert(`Forked! "${forked.metadata.realName}" added to My Custom Agents.`);
  }, []);

  function handleCreateNew() {
    setTab("templates");
  }

  return (
    <main className="min-h-[80vh]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 500px at 50% 0%, rgba(15,76,129,0.04), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F2547]">
                Playbook Studio
              </h1>
              <p className="mt-1.5 text-[#6B7B8F] text-sm sm:text-base max-w-lg">
                Every AI agent is a markdown file you can read, edit, and share. This is the foundation of your team.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                className="inline-flex items-center gap-2 rounded-xl border border-[#1B6EB7]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F4C81] hover:bg-[#F0F5FB] transition-colors"
              >
                <Upload className="h-4 w-4" /> Import
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C81] hover:bg-[#1B6EB7] text-white px-4 py-2.5 text-sm font-bold shadow-[0_4px_12px_-4px_rgba(15,76,129,0.5)] transition-all"
              >
                <Plus className="h-4 w-4" /> Create New Agent
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-[#6B7B8F] font-medium mb-6">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#1B6EB7]" />
              {defaultPlaybooks.length} Official Agents
            </span>
            <span className="text-[#1B6EB7]/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#1B6EB7]" />
              {customPlaybooks.length} Custom
            </span>
            <span className="text-[#1B6EB7]/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {activeCount} Active
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E2E8F0] mb-8">
            {([
              ["active", `Active Agents (${activePlaybooks.length})`],
              ["custom", `My Custom Agents (${customPlaybooks.length})`],
              ["templates", `Templates (${templatePlaybooks.length || 6})`],
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

          {/* ─── ACTIVE AGENTS TAB ─── */}
          {tab === "active" && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activePlaybooks.map((pb, i) => (
                <AgentCard
                  key={pb.metadata.agentId}
                  playbook={pb}
                  index={i}
                  onView={() => setViewerPlaybook(pb)}
                  onDownload={() => handleDownload(pb)}
                  onTest={() => handleTestInChat(pb)}
                  onFork={() => handleFork(pb)}
                  onDelete={
                    !isDefaultPlaybook(pb.metadata.agentId)
                      ? () => handleDelete(pb.metadata.agentId)
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* ─── CUSTOM AGENTS TAB ─── */}
          {tab === "custom" && !loading && (
            <>
              {customPlaybooks.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-12 w-12 text-[#1B6EB7]/20 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-[#0F2547] text-lg mb-2">
                    No custom agents yet
                  </h3>
                  <p className="text-sm text-[#6B7B8F] mb-6 max-w-md mx-auto">
                    Fork an official agent or template, or import a .md playbook to get started.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setTab("templates")}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#1B6EB7]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#0F4C81] hover:bg-[#F0F5FB] transition-colors"
                    >
                      Browse Templates
                    </button>
                    <button
                      onClick={handleImport}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C81] hover:bg-[#1B6EB7] text-white px-5 py-2.5 text-sm font-bold transition-all"
                    >
                      <Upload className="h-4 w-4" /> Import .md File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {customPlaybooks.map((pb, i) => (
                    <AgentCard
                      key={pb.metadata.agentId}
                      playbook={pb}
                      index={i}
                      onView={() => setViewerPlaybook(pb)}
                      onDownload={() => handleDownload(pb)}
                      onTest={() => handleTestInChat(pb)}
                      onFork={() => handleFork(pb)}
                      onDelete={() => handleDelete(pb.metadata.agentId)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── TEMPLATES TAB ─── */}
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
                {templatePlaybooks.length > 0
                  ? templatePlaybooks.map((pb, i) => (
                      <TemplateCard
                        key={pb.metadata.agentId}
                        playbook={pb}
                        index={i}
                        onView={() => setViewerPlaybook(pb)}
                        onDownload={() => handleDownload(pb)}
                        onFork={() => handleFork(pb)}
                      />
                    ))
                  : TEMPLATE_IDS.map((id, i) => {
                      const meta = TEMPLATE_META[id];
                      return (
                        <div
                          key={id}
                          className="rounded-xl bg-white border border-[#E2E8F0] hover:border-[#1B6EB7]/30 hover:shadow-md p-5 transition-all"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase text-[#1B6EB7] bg-[#0F4C81]/10 rounded-full px-2.5 py-1 mb-3">
                              {meta.vertical}
                            </span>
                            <h3 className="font-heading font-bold text-[#0F2547] text-lg leading-tight">
                              {meta.name}
                            </h3>
                            <p className="mt-2 text-sm text-[#6B7B8F] leading-relaxed">
                              {meta.desc}
                            </p>
                            <p className="mt-3 text-xs text-[#6B7B8F]/60 italic">
                              Template file loading…
                            </p>
                          </motion.div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Playbook Viewer Modal */}
      {viewerPlaybook && (
        <PlaybookViewerModal
          playbook={viewerPlaybook}
          open={!!viewerPlaybook}
          onClose={() => setViewerPlaybook(null)}
        />
      )}
    </main>
  );
}

// ─── Agent Card Component ────────────────────────────────────────────────────

function AgentCard({
  playbook,
  index,
  onView,
  onDownload,
  onTest,
  onFork,
  onDelete,
}: {
  playbook: Playbook;
  index: number;
  onView: () => void;
  onDownload: () => void;
  onTest: () => void;
  onFork: () => void;
  onDelete?: () => void;
}) {
  const { metadata } = playbook;
  const Icon = getIcon(metadata.agentId);
  const isOfficial = isDefaultPlaybook(metadata.agentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="group relative rounded-xl bg-white border border-[#E2E8F0] hover:border-[#1B6EB7]/30 hover:-translate-y-0.5 hover:shadow-lg p-5 sm:p-6 transition-all"
    >
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-[#F0F5FB] shrink-0">
          <Icon className="h-6 w-6 text-[#1B6EB7]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-[#0F2547] text-lg leading-tight truncate">
            {metadata.realName}
          </h3>
          <p className="text-sm font-medium text-[#1B6EB7] mt-0.5">
            {metadata.designation}
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className={`text-[9px] font-bold tracking-[0.16em] uppercase rounded-full px-2 py-0.5 ${
              isOfficial
                ? "bg-[#0F4C81]/10 text-[#0F4C81]"
                : "bg-purple-100 text-purple-700"
            }`}>
              {isOfficial ? "Official" : "Custom"}
            </span>
            <span className="text-[9px] font-bold tracking-[0.16em] uppercase rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">
              Active
            </span>
            {metadata.isCaptain && (
              <span className="text-[9px] font-bold tracking-[0.16em] uppercase rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">
                Captain
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-[#6B7B8F] leading-relaxed line-clamp-2">
        {playbook.sections.problem
          ? playbook.sections.problem.slice(0, 120) + (playbook.sections.problem.length > 120 ? "…" : "")
          : metadata.designation}
      </p>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex items-center gap-2 flex-wrap">
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#0F4C81] hover:bg-[#F0F5FB] rounded-lg transition-colors"
          title="View Playbook"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#6B7B8F] hover:text-[#0F4C81] hover:bg-[#F0F5FB] rounded-lg transition-colors"
          title="Export .md"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
        <button
          onClick={onTest}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#6B7B8F] hover:text-[#0F4C81] hover:bg-[#F0F5FB] rounded-lg transition-colors"
          title="Test in Chat"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Test
        </button>
        <button
          onClick={onFork}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#6B7B8F] hover:text-[#0F4C81] hover:bg-[#F0F5FB] rounded-lg transition-colors"
          title="Fork to customize"
        >
          <GitFork className="h-3.5 w-3.5" /> Fork
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Template Card Component ─────────────────────────────────────────────────

function TemplateCard({
  playbook,
  index,
  onView,
  onDownload,
  onFork,
}: {
  playbook: Playbook;
  index: number;
  onView: () => void;
  onDownload: () => void;
  onFork: () => void;
}) {
  const { metadata } = playbook;
  const templateInfo = TEMPLATE_META[metadata.agentId] || { vertical: "Template", name: metadata.realName, desc: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="rounded-xl bg-white border border-[#E2E8F0] hover:border-[#1B6EB7]/30 hover:shadow-md p-5 transition-all"
    >
      <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase text-[#1B6EB7] bg-[#0F4C81]/10 rounded-full px-2.5 py-1 mb-3">
        {templateInfo.vertical}
      </span>
      <h3 className="font-heading font-bold text-[#0F2547] text-lg leading-tight">
        {metadata.realName}
      </h3>
      <p className="mt-2 text-sm text-[#6B7B8F] leading-relaxed line-clamp-2">
        {templateInfo.desc || metadata.designation}
      </p>

      <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center gap-2">
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#0F4C81] hover:bg-[#F0F5FB] rounded-lg transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#6B7B8F] hover:text-[#0F4C81] hover:bg-[#F0F5FB] rounded-lg transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button
          onClick={onFork}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1B6EB7] bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 rounded-lg transition-colors ml-auto"
        >
          <GitFork className="h-3.5 w-3.5" /> Fork Template
        </button>
      </div>
    </motion.div>
  );
}
