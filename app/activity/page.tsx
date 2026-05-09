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

type FilterKey = "all" | "calculated" | "hustle" | "live" | "demo" | "emails";

// Theatrical revenue model — illustrative pipeline value per action
const REV_PER_RUN = 12500;
const REV_PER_EMAIL = 3000;

function timeAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function funnelOf(agentId: string): "calculated" | "hustle" | null {
  const a = AGENTS.find((x) => x.id === agentId);
  return a ? a.funnel : null;
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  useEffect(() => {
    setEntries(getActivity());
  }, []);

  const stats = useMemo(() => {
    if (!entries) return { calc: 0, hustle: 0, emails: 0, projected: 0 };
    const today = new Date().toDateString();
    const todayEntries = entries.filter(
      (e) => new Date(e.timestamp).toDateString() === today
    );
    const runs = todayEntries.filter((e) => e.type === "agent_run");
    const calc = runs.filter((e) => funnelOf(e.agentId) === "calculated").length;
    const hustle = runs.filter((e) => funnelOf(e.agentId) === "hustle").length;
    const emails = todayEntries.filter((e) => e.type === "email_queued").length;
    const projected = runs.length * REV_PER_RUN + emails * REV_PER_EMAIL;
    return { calc, hustle, emails, projected };
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
      if (filter === "calculated")
        return e.type === "agent_run" && funnelOf(e.agentId) === "calculated";
      if (filter === "hustle")
        return e.type === "agent_run" && funnelOf(e.agentId) === "hustle";
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
            Synergistic Selling, logged in real time. Calculated + Hustle, side by side.
          </p>
        </div>
        {entries && entries.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mhsp-muted hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear log
          </button>
        )}
      </div>

      {/* Stats bar — funnel-aware */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <FunnelStat
          icon="🎯"
          label="Calculated runs today"
          value={stats.calc.toString()}
          accent="navy"
        />
        <FunnelStat
          icon="⚡"
          label="Hustle runs today"
          value={stats.hustle.toString()}
          accent="teal"
        />
        <FunnelStat
          icon="✉️"
          label="Emails queued"
          value={stats.emails.toString()}
          accent="gold"
        />
        <FunnelStat
          icon="💥"
          label="Explosive Revenue (projected)"
          value={fmtUSD(stats.projected)}
          accent="success"
          highlight
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(
          [
            ["all", "All", "navy"],
            ["calculated", "🎯 Calculated", "navy"],
            ["hustle", "⚡ Hustle", "teal"],
            ["live", "Live runs", "navy"],
            ["demo", "Demo Mode", "navy"],
            ["emails", "Emails", "navy"],
          ] as const
        ).map(([key, label, color]) => {
          const isActive = filter === key;
          const activeBg =
            color === "teal"
              ? "bg-mhsp-teal text-white border-mhsp-teal"
              : "bg-mhsp-navy text-white border-mhsp-navy";
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-sm font-semibold uppercase tracking-wider rounded-full px-3 py-1.5 border transition-all ${
                isActive
                  ? activeBg
                  : "bg-white text-mhsp-muted border-mhsp-line hover:border-mhsp-navy/30 hover:text-mhsp-navy"
              }`}
            >
              {label}
            </button>
          );
        })}
        <div className="ml-auto">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-sm font-medium rounded-full px-3 py-1.5 border border-mhsp-line bg-white text-mhsp-navy hover:border-mhsp-gold/50 focus:outline-none focus:ring-2 focus:ring-mhsp-gold/30 transition-all cursor-pointer"
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

function FunnelStat({
  icon,
  label,
  value,
  accent,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  accent: "navy" | "gold" | "teal" | "success";
  highlight?: boolean;
}) {
  const accentClass = {
    navy: "text-mhsp-navy",
    gold: "text-mhsp-gold",
    teal: "text-mhsp-teal",
    success: "text-mhsp-success",
  }[accent];
  return (
    <div
      className={`rounded-2xl border p-4 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)] ${
        highlight
          ? "border-mhsp-gold/40 bg-gradient-to-br from-mhsp-gold/10 to-white"
          : "border-mhsp-line bg-white"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <p className="text-[14px] font-semibold tracking-[0.16em] uppercase text-mhsp-muted">
          {label}
        </p>
      </div>
      <p className={`font-numeric text-3xl font-bold mt-1.5 ${accentClass}`}>

        {value}
      </p>
    </div>
  );
}

function Entry({ entry, index }: { entry: ActivityEntry; index: number }) {
  const isRun = entry.type === "agent_run";
  const agent = isRun ? getAgent(entry.agentId) : undefined;
  const funnel = agent?.funnel;
  const funnelDot =
    funnel === "calculated"
      ? "bg-mhsp-navy"
      : funnel === "hustle"
        ? "bg-mhsp-teal"
        : "bg-mhsp-line";

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
      <div className="bg-white rounded-2xl border border-mhsp-line p-4 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
        <div className="flex items-center gap-2 flex-wrap">
          {isRun && funnel && (
            <span className={`h-2 w-2 rounded-full ${funnelDot}`} title={funnel} />
          )}
          <span className="font-display text-sm font-semibold text-mhsp-navy">
            {entry.type === "agent_run"
              ? entry.agentName
              : `Email queued — ${entry.subject}`}
          </span>
          {isRun && funnel && (
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.14em] rounded-full px-2 py-0.5 ${
                funnel === "calculated"
                  ? "bg-mhsp-navy/8 text-mhsp-navy"
                  : "bg-mhsp-teal/12 text-mhsp-teal"
              }`}
            >
              {funnel === "calculated" ? "Calculated" : "Hustle"}
            </span>
          )}
          {entry.type === "agent_run" && entry.isSample && (
            <span className="text-[14px] font-semibold uppercase tracking-wider rounded-full bg-mhsp-cream-warm border border-mhsp-line/60 px-2 py-0.5 text-mhsp-muted">
              Sample
            </span>
          )}
          <span className="ml-auto text-sm text-mhsp-muted font-numeric">
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
