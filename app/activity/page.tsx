"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ActivityEntry,
  clearActivity,
  getActivity,
} from "@/lib/activity-log";
import { Mail, Sparkles, Trash2 } from "lucide-react";
import { AGENTS, getAgent } from "@/lib/agents";

type FilterKey = "all" | "live" | "demo" | "emails";

function timeAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  useEffect(() => {
    setEntries(getActivity());
  }, []);

  const stats = useMemo(() => {
    if (!entries) return { runs: 0, emails: 0, leads: 0, active: 0 };
    const today = new Date().toDateString();
    const todayEntries = entries.filter(
      (e) => new Date(e.timestamp).toDateString() === today
    );
    const runs = todayEntries.filter((e) => e.type === "agent_run").length;
    const emails = todayEntries.filter((e) => e.type === "email_queued").length;
    const leads = todayEntries.filter(
      (e) => e.type === "agent_run" && e.agentId === "01_lead_generation"
    ).length;
    const activeAgents = new Set(
      todayEntries
        .filter((e) => e.type === "agent_run")
        .map((e) => e.agentId)
    );
    return { runs, emails, leads, active: activeAgents.size };
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      if (agentFilter !== "all" && e.agentId !== agentFilter) return false;
      if (filter === "all") return true;
      if (filter === "emails") return e.type === "email_queued";
      if (filter === "live")
        return e.type === "agent_run" && !e.isSample;
      if (filter === "demo")
        return e.type === "agent_run" && e.isSample;
      return true;
    });
  }, [entries, filter, agentFilter]);

  function handleClear() {
    clearActivity();
    setEntries([]);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Live Feed</p>
          <h1 className="font-display text-4xl text-mhsp-navy mt-2">
            Sales Team Activity
          </h1>
          <p className="text-mhsp-muted mt-2">
            Every agent run, logged in real time.
          </p>
        </div>
        {entries && entries.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-mhsp-muted hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear log
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Runs today" value={stats.runs} accent="navy" />
        <Stat label="Emails queued" value={stats.emails} accent="gold" />
        <Stat label="Lead lists" value={stats.leads} accent="teal" />
        <Stat label="Active agents" value={stats.active} accent="success" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(
          [
            ["all", "All"],
            ["live", "Live runs"],
            ["demo", "Demo Mode runs"],
            ["emails", "Emails"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 border transition-all ${
              filter === key
                ? "bg-mhsp-navy text-white border-mhsp-navy"
                : "bg-white text-mhsp-muted border-mhsp-line hover:border-mhsp-navy/30 hover:text-mhsp-navy"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-xs font-medium rounded-full px-3 py-1.5 border border-mhsp-line bg-white text-mhsp-navy hover:border-mhsp-gold/50 focus:outline-none focus:ring-2 focus:ring-mhsp-gold/30 transition-all cursor-pointer"
          >
            <option value="all">By agent: All</option>
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!entries ? (
        <p className="text-mhsp-muted text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-mhsp-line border-dashed rounded-2xl p-12 text-center">
          <p className="text-mhsp-muted text-sm">
            {entries.length === 0 ? (
              <>
                No activity yet. Run an agent or queue an email to see it here.{" "}
                <Link href="/agents" className="underline text-mhsp-navy">
                  Go to team
                </Link>
                .
              </>
            ) : (
              "No entries match this filter."
            )}
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-mhsp-line" />
          <ul className="space-y-3">
            {filtered.map((entry, i) => (
              <Entry key={entry.id} entry={entry} index={i} />
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "navy" | "gold" | "teal" | "success";
}) {
  const accentClass = {
    navy: "text-mhsp-navy",
    gold: "text-mhsp-gold",
    teal: "text-mhsp-teal",
    success: "text-mhsp-success",
  }[accent];
  return (
    <div className="bg-white rounded-2xl border border-mhsp-line p-4 shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-mhsp-muted">
        {label}
      </p>
      <p className={`font-numeric text-3xl font-bold mt-1 ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}

function Entry({ entry, index }: { entry: ActivityEntry; index: number }) {
  const isRun = entry.type === "agent_run";
  const agent = isRun ? getAgent(entry.agentId) : undefined;

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.025 }}
      className="relative pl-12"
    >
      <div className="absolute left-0 top-3 w-10 h-10 rounded-full bg-white border border-mhsp-line flex items-center justify-center shadow-sm">
        {isRun && agent ? (
          <span className="text-lg">{agent.icon}</span>
        ) : isRun ? (
          <Sparkles className="h-4 w-4 text-mhsp-gold" />
        ) : (
          <Mail className="h-4 w-4 text-mhsp-teal" />
        )}
      </div>
      <div className="bg-white rounded-2xl border border-mhsp-line p-4 shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-sm font-semibold text-mhsp-navy">
            {entry.type === "agent_run"
              ? entry.agentName
              : `Email queued — ${entry.subject}`}
          </span>
          {entry.type === "agent_run" && entry.isSample && (
            <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-mhsp-cream-warm border border-mhsp-line/60 px-2 py-0.5 text-mhsp-muted">
              Sample
            </span>
          )}
          <span className="ml-auto text-xs text-mhsp-muted font-numeric">
            {timeAgo(entry.timestamp)}
          </span>
        </div>
        <p className="text-sm text-mhsp-muted mt-1.5 line-clamp-2 leading-relaxed">
          {entry.preview}
        </p>
      </div>
    </motion.li>
  );
}
