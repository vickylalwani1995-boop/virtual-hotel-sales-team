"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AGENTS, getAgent } from "@/lib/agents";
import { AgentOutput } from "@/components/AgentOutput";
import { logActivity } from "@/lib/activity-log";
import { useDemoMode } from "@/lib/demo-mode";

type Status = "queued" | "running" | "done" | "error";
type Step = {
  agentId: string;
  status: Status;
  output?: string;
  error?: string;
};

const PARALLEL_AGENTS = ["01_lead_generation", "02_outbound_sales", "08_after_sales"];
const DIRECTOR_ID = "00_director_of_sales";
const ALL_IDS = [DIRECTOR_ID, ...PARALLEL_AGENTS];

async function callAgentLive(agentId: string, hotelProfile: string) {
  const res = await fetch("/api/run-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, hotelProfile }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Agent failed");
  return data.output as string;
}

async function callAgentDemo(agentId: string) {
  const res = await fetch(`/api/sample-output?agentId=${agentId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "No sample");
  return (typeof data.output === "string"
    ? data.output
    : JSON.stringify(data.output, null, 2)) as string;
}

export function WorkflowRunner({ profile }: { profile: string }) {
  const [demoMode] = useDemoMode();
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [activeTab, setActiveTab] = useState<string>(DIRECTOR_ID);

  // When a step completes, jump to its tab so the user sees output landing live
  useEffect(() => {
    const lastDone = [...steps].reverse().find((s) => s.status === "done");
    if (lastDone) setActiveTab(lastDone.agentId);
  }, [steps]);

  function updateStep(agentId: string, patch: Partial<Step>) {
    setSteps((prev) =>
      prev.map((s) => (s.agentId === agentId ? { ...s, ...patch } : s))
    );
  }

  async function runOne(agentId: string) {
    return demoMode ? callAgentDemo(agentId) : callAgentLive(agentId, profile);
  }

  async function run() {
    if (!profile) return;
    setRunning(true);
    const initial: Step[] = ALL_IDS.map((id) => ({
      agentId: id,
      status: "queued",
    }));
    setSteps(initial);
    setActiveTab(DIRECTOR_ID);

    updateStep(DIRECTOR_ID, { status: "running" });
    try {
      const out = await runOne(DIRECTOR_ID);
      updateStep(DIRECTOR_ID, { status: "done", output: out });
      const dir = getAgent(DIRECTOR_ID)!;
      logActivity({
        type: "agent_run",
        agentId: dir.id,
        agentName: dir.name,
        preview: out.slice(0, 100),
        isSample: demoMode,
      });
    } catch (e: unknown) {
      updateStep(DIRECTOR_ID, {
        status: "error",
        error: e instanceof Error ? e.message : "Failed",
      });
      setRunning(false);
      return;
    }

    PARALLEL_AGENTS.forEach((id) => updateStep(id, { status: "running" }));
    await Promise.all(
      PARALLEL_AGENTS.map(async (id) => {
        try {
          const out = await runOne(id);
          updateStep(id, { status: "done", output: out });
          const a = getAgent(id)!;
          logActivity({
            type: "agent_run",
            agentId: a.id,
            agentName: a.name,
            preview: out.slice(0, 100),
            isSample: demoMode,
          });
        } catch (e: unknown) {
          updateStep(id, {
            status: "error",
            error: e instanceof Error ? e.message : "Failed",
          });
        }
      })
    );

    setRunning(false);
  }

  const hasResults = steps.length > 0;
  const completedCount = steps.filter((s) => s.status === "done").length;
  const totalCount = steps.length;

  return (
    <div className="space-y-5">
      {/* Trigger card */}
      <div className="relative rounded-2xl border-2 border-mhsp-gold/40 bg-gradient-to-br from-mhsp-gold/15 via-mhsp-cream-warm to-white p-6 shadow-[0_8px_30px_-12px_rgba(212,165,55,0.4)] overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-mhsp-gold/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="eyebrow">The Showstopper</p>
              {demoMode && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-mhsp-success">
                  <span className="h-1 w-1 rounded-full bg-mhsp-success animate-pulse" />
                  Instant
                </span>
              )}
            </div>
            <h3 className="font-display text-2xl text-mhsp-navy mt-1.5">
              Generate Full Workflow
            </h3>
            <p className="text-sm text-mhsp-muted mt-1.5 max-w-md">
              Director plans the strategy. Then Lead Gen, Outbound, and After-Sales
              run in parallel.
            </p>
          </div>
          <button
            onClick={run}
            disabled={running || !profile}
            className="inline-flex items-center gap-2 rounded-xl bg-mhsp-navy hover:bg-mhsp-navy-soft disabled:opacity-40 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(11,36,71,0.5)] transition-all"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Running…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Full Workflow
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress tracker */}
      {hasResults && (
        <div className="rounded-2xl bg-white border border-mhsp-line p-5 shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">Workflow Progress</p>
            <span className="font-numeric text-xs text-mhsp-muted">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((s) => {
              const a = getAgent(s.agentId);
              return (
                <div
                  key={s.agentId}
                  className={`rounded-xl border p-3 transition-all ${
                    s.status === "done"
                      ? "border-mhsp-success/30 bg-mhsp-success/5"
                      : s.status === "running"
                        ? "border-mhsp-gold/40 bg-mhsp-gold/5"
                        : s.status === "error"
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-mhsp-line bg-mhsp-cream-warm/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{a?.icon}</span>
                    <StatusIcon status={s.status} />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-mhsp-navy leading-snug">
                    {a?.name}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider font-medium text-mhsp-muted">
                    {labelFor(s.status)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabbed output viewer */}
      {hasResults && steps.some((s) => s.output) && (
        <div className="rounded-2xl bg-white border border-mhsp-line shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)] overflow-hidden">
          <div className="flex items-center gap-1 border-b border-mhsp-line bg-mhsp-cream-warm/30 px-2 overflow-x-auto">
            {steps.map((s) => {
              const a = getAgent(s.agentId);
              const isActive = activeTab === s.agentId;
              const isReady = s.status === "done";
              return (
                <button
                  key={s.agentId}
                  onClick={() => isReady && setActiveTab(s.agentId)}
                  disabled={!isReady}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-mhsp-navy"
                      : isReady
                        ? "text-mhsp-muted hover:text-mhsp-navy"
                        : "text-mhsp-muted/50 cursor-not-allowed"
                  }`}
                >
                  <span className="text-base">{a?.icon}</span>
                  <span className="hidden sm:inline">{a?.name}</span>
                  {s.status === "running" && (
                    <Loader2 className="h-3 w-3 animate-spin text-mhsp-gold" />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-mhsp-gold"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {steps
                .filter((s) => s.agentId === activeTab)
                .map((s) => {
                  const a = AGENTS.find((x) => x.id === s.agentId);
                  return (
                    <motion.div
                      key={s.agentId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-mhsp-line">
                        <span className="text-3xl">{a?.icon}</span>
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-mhsp-gold">
                            {a?.name.replace(/\s+Agent$/i, "").toUpperCase()}
                          </p>
                          <h3 className="font-display text-xl text-mhsp-navy leading-tight">
                            {a?.name}
                          </h3>
                        </div>
                      </div>
                      {s.output ? (
                        <AgentOutput output={s.output} animate={false} bare />
                      ) : s.status === "running" ? (
                        <div className="text-sm text-mhsp-muted flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-mhsp-gold" />
                          Working…
                        </div>
                      ) : (
                        <div className="text-sm text-mhsp-muted">Queued.</div>
                      )}
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "done")
    return <CheckCircle2 className="h-4 w-4 text-mhsp-success" />;
  if (status === "running")
    return <Loader2 className="h-4 w-4 animate-spin text-mhsp-gold" />;
  if (status === "error") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-mhsp-muted/50" />;
}

function labelFor(status: Status) {
  if (status === "done") return "✓ Done";
  if (status === "running") return "Running…";
  if (status === "error") return "Failed";
  return "Queued";
}
