"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getAgent } from "@/lib/agents";
import { AgentOutput } from "@/components/AgentOutput";
import { DownloadButtons } from "@/components/DownloadButtons";
import { EmailQueueModal } from "@/components/EmailQueueModal";
import { hasEmailContent } from "@/lib/email-parser";
import { WorkflowRunner } from "@/components/WorkflowRunner";
import { ArrowLeft, Loader2, Play, FileText, Sparkles, RotateCw } from "lucide-react";
import { logActivity } from "@/lib/activity-log";
import { useDemoMode } from "@/lib/demo-mode";

const GRADIENT: Record<string, string> = {
  teal: "from-mhsp-teal to-mhsp-navy",
  green: "from-emerald-500 to-mhsp-teal",
  blue: "from-mhsp-teal to-mhsp-navy-soft",
  purple: "from-purple-500 to-mhsp-navy",
  orange: "from-orange-500 to-mhsp-gold",
  amber: "from-amber-400 to-mhsp-gold",
  indigo: "from-indigo-500 to-mhsp-navy",
  pink: "from-pink-400 to-purple-500",
  red: "from-rose-500 to-mhsp-navy",
  emerald: "from-emerald-500 to-mhsp-teal",
  violet: "from-violet-500 to-mhsp-navy",
};

function AgentDetail({ id }: { id: string }) {
  const agent = getAgent(id);
  const searchParams = useSearchParams();
  const profile = searchParams.get("profile") ?? "";
  const [demoMode] = useDemoMode();

  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [outputIsSample, setOutputIsSample] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!agent) return notFound();

  const gradient = GRADIENT[agent.color] ?? GRADIENT.teal;
  const isDirector = agent.id === "00_director_of_sales";
  const isOutbound = agent.id === "02_outbound_sales";
  const isLeadGen = agent.id === "01_lead_generation";

  async function fetchSample(agentId: string): Promise<string> {
    const res = await fetch(`/api/sample-output?agentId=${agentId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "No sample yet");
    return typeof data.output === "string"
      ? data.output
      : "```json\n" + JSON.stringify(data.output, null, 2) + "\n```";
  }

  async function runAgent() {
    if (!profile || !agent) return;
    setRunning(true);
    setError(null);
    setOutput(null);
    setOutputIsSample(false);

    if (demoMode) {
      try {
        const text = await fetchSample(agent.id);
        setOutput(text);
        setOutputIsSample(true);
        logActivity({
          type: "agent_run",
          agentId: agent.id,
          agentName: agent.name,
          preview: text.slice(0, 100),
          isSample: true,
        });
      } catch {
        // suppressed in demo mode
      } finally {
        setRunning(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, hotelProfile: profile }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Agent failed");
      setOutput(data.output);
      logActivity({
        type: "agent_run",
        agentId: agent.id,
        agentName: agent.name,
        preview: (data.output as string).slice(0, 100),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  async function loadSample() {
    if (!agent) return;
    setRunning(true);
    setError(null);
    setOutput(null);
    setOutputIsSample(false);
    try {
      const text = await fetchSample(agent.id);
      setOutput(text);
      setOutputIsSample(true);
      logActivity({
        type: "agent_run",
        agentId: agent.id,
        agentName: agent.name,
        preview: text.slice(0, 100),
        isSample: true,
      });
    } catch (e: unknown) {
      if (!demoMode) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6 text-sm text-mhsp-muted">
        <Link
          href={`/agents?profile=${encodeURIComponent(profile)}`}
          className="hover:text-mhsp-navy transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Sales Team
        </Link>
        <span className="mx-2 text-mhsp-line">/</span>
        <span className="text-mhsp-navy">{agent.name}</span>
      </div>

      <div
        className={`relative h-32 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br ${gradient}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          {agent.icon}
        </div>
        <span
          className={`absolute top-4 left-6 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[14px] font-bold tracking-wider uppercase ${
            agent.tier === 1
              ? "bg-mhsp-success text-white"
              : "bg-mhsp-gold text-white"
          }`}
        >
          <span className="h-1 w-1 rounded-full bg-current" />
          {agent.tier === 1 ? "LIVE" : "READY"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
        {/* Left — agent identity */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-mhsp-line p-6 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
            <p className="eyebrow">{labelFromName(agent.name)}</p>
            <h1 className="font-display text-3xl text-mhsp-navy mt-2 leading-tight">
              {agent.name}
            </h1>
            <p className="text-sm text-mhsp-muted mt-3 leading-relaxed">
              {agent.description}
            </p>

            {!isDirector && (
              <div className="mt-5 pt-5 border-t border-mhsp-line/60 space-y-1.5">
                <p className="text-sm text-mhsp-muted">
                  <span className="font-semibold text-mhsp-navy">Reports to:</span>{" "}
                  Director of Sales
                </p>
                <p className="text-sm text-mhsp-muted">
                  <span className="font-semibold text-mhsp-navy">Used by:</span>{" "}
                  <span className="font-numeric text-mhsp-success">1,200+</span>{" "}
                  hotels
                </p>
              </div>
            )}
            {isDirector && (
              <div className="mt-5 pt-5 border-t border-mhsp-line/60">
                <p className="text-sm text-mhsp-muted">
                  <span className="font-semibold text-mhsp-navy">Used by:</span>{" "}
                  <span className="font-numeric text-mhsp-success">1,200+</span>{" "}
                  hotels nationwide
                </p>
              </div>
            )}

            {profile && <ProfileChips profile={profile} />}
          </div>
        </aside>

        {/* Right — output area */}
        <div className="space-y-4">
          {/* Action card */}
          <div className="bg-white rounded-2xl border border-mhsp-line p-5 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
            {!profile ? (
              <p className="text-sm text-mhsp-muted">
                No hotel profile.{" "}
                <Link href="/" className="underline text-mhsp-navy">
                  Add one first
                </Link>
                .
              </p>
            ) : agent.tier === 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-mhsp-navy">
                    Ready to run
                  </p>
                  <p className="text-sm text-mhsp-muted">
                    {demoMode
                      ? "Demo Mode — instant cached output"
                      : "Will call Claude API and generate a fresh response"}
                  </p>
                </div>
                <button
                  onClick={runAgent}
                  disabled={running}
                  className="inline-flex items-center gap-2 rounded-lg bg-mhsp-gold hover:bg-mhsp-gold-soft disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(27,110,183,0.5)] transition-all"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Working…
                    </>
                  ) : output ? (
                    <>
                      <RotateCw className="h-4 w-4" /> Run Again
                    </>
                  ) : demoMode ? (
                    <>
                      <Sparkles className="h-4 w-4" /> Run Agent (instant)
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Run Agent
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-mhsp-navy">
                    Sample ready
                  </p>
                  <p className="text-sm text-mhsp-muted">
                    Pre-generated output for client walkthroughs
                  </p>
                </div>
                <button
                  onClick={loadSample}
                  disabled={running}
                  className="inline-flex items-center gap-2 rounded-lg border border-mhsp-navy/15 bg-white hover:border-mhsp-gold/60 hover:bg-mhsp-cream-warm/40 disabled:opacity-40 px-5 py-2.5 text-sm font-semibold text-mhsp-navy transition-all"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" /> Load sample
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {isDirector && profile && <WorkflowRunner profile={profile} />}

          {/* Output zone */}
          {running && !output && <SkeletonLoader />}

          {error && !demoMode && (
            <div className="bg-white border border-destructive/30 rounded-2xl p-5 text-sm text-destructive">
              {error}
            </div>
          )}

          {!running && !output && !error && profile && !isDirector && (
            <EmptyState agentName={agent.name} icon={agent.icon} />
          )}

          {output && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-2xl border border-mhsp-line p-4 flex flex-wrap items-center gap-2 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
                <DownloadButtons
                  output={output}
                  basename={agent.id}
                  showExcel={isLeadGen}
                />
                {(isOutbound || hasEmailContent(output)) && (
                  <EmailQueueModal agentId={agent.id} output={output} />
                )}
                {outputIsSample && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-mhsp-cream-warm border border-mhsp-line/60 px-2.5 py-1 text-[14px] font-semibold uppercase tracking-wider text-mhsp-muted">
                    Sample
                  </span>
                )}
              </div>
              <AgentOutput output={output} />
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

function ProfileChips({ profile }: { profile: string }) {
  const fields = [
    "Hotel Name",
    "Location",
    "Rooms",
    "Brand",
    "Average Daily Rate",
    "Current Occupancy",
    "Weak Days",
    "Main Need",
    "Target Business",
    "Meeting Space",
    "Catering",
  ];
  const rows: { label: string; value: string }[] = [];
  for (const f of fields) {
    const re = new RegExp(`${f}\\s*:\\s*([^\\n]+)`, "i");
    const m = profile.match(re);
    if (m) rows.push({ label: f, value: m[1].trim() });
  }
  if (rows.length === 0) {
    return (
      <div className="mt-5 pt-5 border-t border-mhsp-line/60">
        <p className="text-[14px] font-semibold tracking-[0.18em] text-mhsp-gold uppercase mb-2">
          Working with
        </p>
        <p className="text-sm text-mhsp-muted leading-relaxed line-clamp-6">
          {profile}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-6 pt-6 border-t border-mhsp-line/60">
      <p className="text-[14px] font-semibold tracking-[0.18em] text-mhsp-gold uppercase mb-3">
        Working with
      </p>
      <dl className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5">
            <dt className="text-[14px] font-semibold uppercase tracking-wider text-mhsp-muted">
              {r.label}
            </dt>
            <dd className="text-sm text-mhsp-navy font-medium leading-snug">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EmptyState({ agentName, icon }: { agentName: string; icon: string }) {
  return (
    <div className="bg-mhsp-cream-warm/40 border border-mhsp-line border-dashed rounded-2xl p-10 text-center">
      <div className="text-5xl mb-3 opacity-60">{icon}</div>
      <p className="font-display text-xl text-mhsp-navy italic">
        &ldquo;I&apos;m ready when you are. Click <span className="not-italic font-semibold">Run Agent</span> to begin.&rdquo;
      </p>
      <p className="text-sm text-mhsp-muted mt-2">— {agentName}</p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="bg-white rounded-2xl border border-mhsp-line p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
      <div className="flex items-center gap-2 mb-5">
        <Loader2 className="h-4 w-4 animate-spin text-mhsp-gold" />
        <span className="text-sm font-semibold text-mhsp-navy">Working…</span>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-mhsp-cream-warm rounded animate-pulse w-1/3" />
        <div className="h-3 bg-mhsp-cream-warm rounded animate-pulse w-full" />
        <div className="h-3 bg-mhsp-cream-warm rounded animate-pulse w-5/6" />
        <div className="h-3 bg-mhsp-cream-warm rounded animate-pulse w-2/3" />
        <div className="h-3 bg-mhsp-cream-warm rounded animate-pulse w-4/5" />
      </div>
    </div>
  );
}

function labelFromName(name: string) {
  return name.replace(/\s+Agent$/i, "").toUpperCase();
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-10 text-mhsp-muted">Loading…</div>}>
      <AgentDetail id={id} />
    </Suspense>
  );
}
