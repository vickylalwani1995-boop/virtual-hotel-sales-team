"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ActivityEntry,
  clearActivity,
  getActivity,
} from "@/lib/activity-log";
import {
  Mail,
  Sparkles,
  Trash2,
  Crosshair,
  Zap,
  TrendingUp,
  Activity as ActivityIcon,
  Filter,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { AGENTS, getAgent } from "@/lib/agents";
import { iconForAgent } from "@/lib/agent-icons";

type FilterKey = "all" | "calculated" | "hustle" | "live" | "demo" | "emails";

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
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    setEntries(getActivity());
  }, []);

  const stats = useMemo(() => {
    if (!entries) return { calc: 0, hustle: 0, emails: 0, projected: 0 };
    const today = new Date().toDateString();
    const todayEntries = entries.filter(
      (e) => new Date(e.timestamp).toDateString() === today,
    );
    const runs = todayEntries.filter((e) => e.type === "agent_run");
    const calc = runs.filter((e) => funnelOf(e.agentId) === "calculated").length;
    const hustle = runs.filter((e) => funnelOf(e.agentId) === "hustle").length;
    const emails = todayEntries.filter(
      (e) => e.type === "email_queued",
    ).length;
    const projected = runs.length * REV_PER_RUN + emails * REV_PER_EMAIL;
    return { calc, hustle, emails, projected };
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      if (agentFilter !== "all" && e.agentId !== agentFilter) return false;
      if (filter === "all") return true;
      if (filter === "emails") return e.type === "email_queued";
      if (filter === "live") return e.type === "agent_run" && !e.isSample;
      if (filter === "demo") return e.type === "agent_run" && e.isSample;
      if (filter === "calculated")
        return e.type === "agent_run" && funnelOf(e.agentId) === "calculated";
      if (filter === "hustle")
        return e.type === "agent_run" && funnelOf(e.agentId) === "hustle";
      return true;
    });
  }, [entries, filter, agentFilter]);

  function handleClearConfirm() {
    clearActivity();
    setEntries([]);
    setConfirmClearOpen(false);
  }

  return (
    <main>
      {/* ============= HERO BAND ============= */}
      <section className="relative overflow-hidden border-b border-[#E5ECF4]">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 480px at 14% 0%, rgba(47,143,204,0.10), transparent 60%), radial-gradient(800px 480px at 92% 100%, rgba(15,76,129,0.08), transparent 65%), linear-gradient(180deg, #FCFDFE 0%, #F1F5FA 100%)",
          }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(15,76,129,0.7) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-mhsp-success opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mhsp-success" />
                </span>
                Live feed
              </span>
              <h1 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
                Sales Team Activity.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-mhsp-muted leading-relaxed max-w-2xl">
                Synergistic Selling, logged in real time. Calculated{" "}
                <span className="text-mhsp-navy font-semibold">+</span> Hustle,
                side by side.
              </p>
            </div>

            {entries && entries.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#FECACA] bg-white hover:bg-[#FEF2F2] text-[#B91C1C] px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear log
              </button>
            )}
          </div>

          {/* Stats grid */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              Icon={Crosshair}
              label="Calculated today"
              value={stats.calc.toString()}
              tone="navy"
            />
            <StatCard
              Icon={Zap}
              label="Hustle today"
              value={stats.hustle.toString()}
              tone="teal"
            />
            <StatCard
              Icon={Mail}
              label="Emails queued"
              value={stats.emails.toString()}
              tone="teal"
            />
            <StatCard
              Icon={TrendingUp}
              label="Projected revenue"
              value={fmtUSD(stats.projected)}
              tone="navy"
              highlight
            />
          </div>
        </div>
      </section>

      {/* ============= FILTER BAR + TIMELINE ============= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Filter bar */}
        <div className="mb-7 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold tracking-[0.14em] uppercase text-mhsp-muted">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {(
              [
                ["all", "All", "navy"],
                ["calculated", "Calculated", "navy"],
                ["hustle", "Hustle", "teal"],
                ["live", "Live runs", "navy"],
                ["demo", "Demo Mode", "navy"],
                ["emails", "Emails", "teal"],
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
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`text-sm font-semibold tracking-wide rounded-full px-3.5 py-1.5 border transition-all ${
                    isActive
                      ? activeBg
                      : "bg-white text-mhsp-muted border-[#DCE5EF] hover:border-mhsp-navy/30 hover:text-mhsp-navy"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="lg:ml-auto relative w-full lg:w-auto">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="appearance-none w-full lg:w-auto text-sm font-semibold rounded-xl pl-3.5 pr-11 py-2 border border-[#DCE5EF] bg-white text-mhsp-navy hover:border-[#1B6EB7]/50 focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 transition-all"
            >
              <option value="all">By agent: All</option>
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mhsp-muted"
              strokeWidth={2.25}
            />
          </div>
        </div>

        {/* Timeline */}
        {!entries ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasAny={entries.length > 0} />
        ) : (
          <div className="relative">
            {/* Timeline rail */}
            <div className="absolute left-[23px] top-3 bottom-3 w-px bg-gradient-to-b from-[#DCE5EF] via-[#DCE5EF] to-transparent" />
            <ul className="space-y-3">
              {filtered.map((entry, i) => (
                <EntryRow key={entry.id} entry={entry} index={i} />
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Clear-log confirmation modal */}
      <ClearLogModal
        open={confirmClearOpen}
        count={entries?.length ?? 0}
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={handleClearConfirm}
      />
    </main>
  );
}

/* ----------------- StatCard ----------------- */

function StatCard({
  Icon,
  label,
  value,
  tone,
  highlight = false,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  tone: "navy" | "teal";
  highlight?: boolean;
}) {
  const tile =
    tone === "navy"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_8px_28px_-12px_rgba(15,76,129,0.14),0_2px_8px_-4px_rgba(15,76,129,0.06)] ${
        highlight
          ? "border-[#DCE5EF] bg-gradient-to-br from-[#F4F8FC] via-white to-white"
          : "border-[#E5ECF4] bg-white"
      }`}
    >
      {highlight && (
        <span
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-[0.08] pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, #1B6EB7, transparent)",
          }}
        />
      )}
      <div className="relative flex items-start gap-3">
        <div
          className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-[0_6px_18px_-8px_rgba(15,76,129,0.5)] ${tile}`}
        >
          <Icon className="h-[20px] w-[20px]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-[0.14em] uppercase text-mhsp-muted leading-tight">
            {label}
          </p>
          <p className="mt-1.5 font-numeric text-2xl sm:text-[28px] font-bold text-mhsp-navy leading-none">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----------------- EntryRow ----------------- */

function EntryRow({ entry, index }: { entry: ActivityEntry; index: number }) {
  const isRun = entry.type === "agent_run";
  const agent = isRun ? getAgent(entry.agentId) : undefined;
  const funnel = agent?.funnel;

  const Icon = isRun && agent ? iconForAgent(agent.id) : Mail;
  const iconTile =
    funnel === "calculated"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : funnel === "hustle"
        ? "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]"
        : "bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81]";

  const title = isRun
    ? agent?.name ?? "Agent run"
    : `Email queued — ${entry.subject}`;

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 12) * 0.025 }}
      className="relative pl-14 sm:pl-16"
    >
      {/* Timeline dot / icon tile */}
      <div
        className={`absolute left-0 top-3 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-[0_8px_22px_-8px_rgba(15,76,129,0.55)] ring-4 ring-[#FBFCFE] ${iconTile}`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#E5ECF4] p-4 sm:p-5 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)] hover:border-[#C9DAEB] hover:shadow-[0_8px_24px_-12px_rgba(15,76,129,0.16)] transition-all">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-heading text-base sm:text-[17px] font-bold text-mhsp-navy leading-tight">
            {title}
          </span>

          {/* Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isRun && funnel && (
              <Chip
                tone={funnel === "calculated" ? "navy" : "teal"}
                Icon={funnel === "calculated" ? Crosshair : Zap}
                label={funnel === "calculated" ? "Calculated" : "Hustle"}
              />
            )}
            {entry.type === "agent_run" && entry.isSample && (
              <Chip tone="muted" label="Sample" />
            )}
            {entry.type === "agent_run" && !entry.isSample && (
              <Chip
                tone="success"
                label="Live"
                dot
              />
            )}
            {entry.type === "email_queued" && (
              <Chip tone="teal" Icon={Mail} label="Email" />
            )}
          </div>

          <span className="ml-auto text-sm text-mhsp-muted font-numeric whitespace-nowrap">
            {timeAgo(entry.timestamp)}
          </span>
        </div>

        {entry.preview && (
          <p className="text-sm text-mhsp-muted mt-2 line-clamp-2 leading-relaxed">
            {entry.preview}
          </p>
        )}
      </div>
    </motion.li>
  );
}

function Chip({
  tone,
  label,
  Icon,
  dot = false,
}: {
  tone: "navy" | "teal" | "muted" | "success";
  label: string;
  Icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  dot?: boolean;
}) {
  const cls = {
    navy: "bg-[#EAF2FA] text-[#0F4C81] border-[#C9DAEB]",
    teal: "bg-[#E3F1FA] text-[#1B6EB7] border-[#C7DFEE]",
    muted: "bg-[#F4F8FC] text-mhsp-muted border-[#DCE5EF]",
    success: "bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-bold tracking-[0.1em] uppercase ${cls}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
      )}
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.5} />}
      {label}
    </span>
  );
}

/* ----------------- EmptyState ----------------- */

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="relative bg-white rounded-2xl border border-[#E5ECF4] border-dashed px-6 py-14 text-center max-w-2xl mx-auto">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] text-white shadow-[0_8px_24px_-8px_rgba(27,110,183,0.5)] mb-4">
        <ActivityIcon className="h-6 w-6" strokeWidth={2.25} />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-mhsp-navy">
        {hasAny ? "Nothing matches this filter." : "No activity yet."}
      </h3>
      <p className="mt-2 text-mhsp-muted text-base leading-relaxed">
        {hasAny
          ? "Try a different filter combo, or clear the filters to see the full log."
          : "Run an agent or queue an email and it'll show up here in real time."}
      </p>
      {!hasAny && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/agents"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:-translate-y-0.5 transition-all"
          >
            Go to team
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-6 py-3 text-sm font-semibold transition-all"
          >
            Edit profile
          </Link>
        </div>
      )}
    </div>
  );
}

/* ----------------- ClearLogModal ----------------- */

function ClearLogModal({
  open,
  count,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[60] bg-[#0F1B2D]/55 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#B91C1C]" />
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#B91C1C]">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-xl font-bold text-mhsp-navy leading-tight">
                Clear activity log?
              </h2>
              <p className="mt-1.5 text-sm text-mhsp-muted leading-relaxed">
                This permanently removes{" "}
                <span className="font-semibold text-mhsp-navy">
                  {count} {count === 1 ? "entry" : "entries"}
                </span>{" "}
                from the log. This action can&apos;t be undone.
              </p>
            </div>
          </div>
          <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              autoFocus
              className="inline-flex items-center justify-center rounded-lg border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              No, keep it
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] shadow-[0_8px_18px_-8px_rgba(185,28,28,0.55)] transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Yes, clear
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
