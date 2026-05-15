"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity as ActivityIcon,
  Users,
  Mail,
  CalendarClock,
  Crosshair,
  Zap,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ClipboardList,
  MapPin,
  Flame,
} from "lucide-react";
import { AGENTS, getAgent } from "@/lib/agents";
import { getActivity, type ActivityEntry } from "@/lib/activity-log";
import { getAllLeads, type Lead } from "@/lib/leads";
import { loadMessages, formatTime } from "@/lib/team-chat";
import { loadTasks, AGENT_NAMES } from "@/lib/tasks";

type Range = "today" | "week" | "month" | "all";

const RANGE_LABELS: Record<Range, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  all: "All time",
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  qualified: "Qualified",
  closed: "Closed",
};

const STATUS_COLORS: Record<Lead["status"], string> = {
  new: "#2F8FCC",
  contacted: "#F59E0B",
  replied: "#1E5896",
  qualified: "#15803D",
  closed: "#94A3B8",
};

const SOURCE_LABELS: Record<Lead["source"], string> = {
  apollo: "Apollo",
  vibe: "Vibe",
  agent_generated: "Lead Gen Agent",
  manual: "Manual",
};

const SOURCE_COLORS: Record<Lead["source"], string> = {
  apollo: "#1B6EB7",
  vibe: "#6D28D9",
  agent_generated: "#15803D",
  manual: "#94A3B8",
};

function rangeStart(range: Range): number {
  const now = Date.now();
  if (range === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (range === "week") return now - 7 * 24 * 60 * 60 * 1000;
  if (range === "month") return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

function funnelOf(agentId: string): "calculated" | "hustle" | null {
  return AGENTS.find((a) => a.id === agentId)?.funnel ?? null;
}

function fmtPct(n: number, denom: number): string {
  if (denom === 0) return "0%";
  return `${Math.round((n / denom) * 100)}%`;
}

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [range, setRange] = useState<Range>("week");
  const [chatMsgCount, setChatMsgCount] = useState(0);
  const [lastChatAgent, setLastChatAgent] = useState<{ name: string; time: string } | null>(null);
  const [taskStats, setTaskStats] = useState({ inProgress: 0, overdue: 0, done: 0, topAgent: "" });
  const [backyardStats, setBackyardStats] = useState<{ total: number; hot: number; top: string; scannedAt: string } | null>(null);

  useEffect(() => {
    const sync = () => {
      setActivity(getActivity());
      setLeads(getAllLeads());
    };
    sync();
    setHydrated(true);
    const evts = ["vhst-leads-changed", "vhst-notifications-changed", "storage"];
    for (const e of evts) window.addEventListener(e, sync);

    // Chat + task stats
    try {
      const msgs = loadMessages("sales-team");
      const agentMsgs = msgs.filter((m) => m.authorType === "agent")
      setChatMsgCount(msgs.length);
      if (agentMsgs.length > 0) {
        const last = agentMsgs[agentMsgs.length - 1]
        setLastChatAgent({ name: last.authorName, time: formatTime(last.timestamp) })
      }
      const tasks = loadTasks();
      const now = Date.now()
      const inProgress = tasks.filter((t) => t.status === "in_progress").length
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "done").length
      const done = tasks.filter((t) => t.status === "done").length
      const inProgTasks = tasks.filter((t) => t.status === "in_progress")
      const topAgent = inProgTasks.length > 0 ? AGENT_NAMES[inProgTasks[0].assigneeId] ?? "" : ""
      const topTask = inProgTasks.length > 0 ? inProgTasks[0].title : ""
      setTaskStats({ inProgress, overdue, done, topAgent: topTask ? `${topAgent} working on ${topTask}` : "" })
    } catch { /* ignore */ }

    // Backyard scan stats
    fetch("/api/backyard-scan")
      .then((r) => r.json())
      .then((json) => {
        const businesses: Array<{ qualification: { tier: string; score: number }; name: string }> = json.businesses ?? []
        const hot = businesses.filter((b) => b.qualification.tier === "Hot").length
        const top = businesses.sort((a, b) => b.qualification.score - a.qualification.score)[0]
        setBackyardStats({ total: businesses.length, hot, top: top?.name ?? "—", scannedAt: json._meta?.scannedAt ?? "" })
      })
      .catch(() => { /* ignore */ })

    return () => {
      for (const e of evts) window.removeEventListener(e, sync);
    };
  }, []);

  const cutoff = useMemo(() => rangeStart(range), [range]);

  /* --- filtered slices --- */
  const filteredActivity = useMemo(
    () => activity.filter((a) => new Date(a.timestamp).getTime() >= cutoff),
    [activity, cutoff],
  );
  const filteredLeads = useMemo(
    () => leads.filter((l) => new Date(l.createdAt).getTime() >= cutoff),
    [leads, cutoff],
  );

  /* --- KPIs --- */
  const stats = useMemo(() => {
    const totalRuns = filteredActivity.filter(
      (e) => e.type === "agent_run",
    ).length;
    const emailsCount = filteredActivity.filter(
      (e) => e.type === "email_queued",
    ).length;
    const leadsCount = filteredLeads.length;
    const sequences = 0; // vhst-sequences not implemented yet

    const calcRuns = filteredActivity.filter(
      (e) => e.type === "agent_run" && funnelOf(e.agentId) === "calculated",
    ).length;
    const hustleRuns = filteredActivity.filter(
      (e) => e.type === "agent_run" && funnelOf(e.agentId) === "hustle",
    ).length;

    return {
      totalRuns,
      leadsCount,
      emailsCount,
      sequences,
      calcPct: fmtPct(calcRuns, totalRuns),
      hustlePct: fmtPct(hustleRuns, totalRuns),
    };
  }, [filteredActivity, filteredLeads]);

  /* --- Activity by Agent (bar chart data) --- */
  const activityByAgent = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of filteredActivity) {
      if (e.type !== "agent_run") continue;
      counts.set(e.agentId, (counts.get(e.agentId) ?? 0) + 1);
    }
    return AGENTS.map((a) => ({
      id: a.id,
      name: a.realName,
      runs: counts.get(a.id) ?? 0,
      funnel: a.funnel,
    }))
      .filter((r) => r.runs > 0)
      .sort((a, b) => b.runs - a.runs);
  }, [filteredActivity]);

  /* --- Lead status / source donut data --- */
  const statusData = useMemo(() => {
    const counts: Record<Lead["status"], number> = {
      new: 0,
      contacted: 0,
      replied: 0,
      qualified: 0,
      closed: 0,
    };
    for (const l of filteredLeads) counts[l.status]++;
    return (Object.keys(counts) as Lead["status"][])
      .map((k) => ({
        name: STATUS_LABELS[k],
        value: counts[k],
        color: STATUS_COLORS[k],
      }))
      .filter((s) => s.value > 0);
  }, [filteredLeads]);

  const sourceData = useMemo(() => {
    const counts: Record<Lead["source"], number> = {
      apollo: 0,
      vibe: 0,
      agent_generated: 0,
      manual: 0,
    };
    for (const l of filteredLeads) counts[l.source]++;
    return (Object.keys(counts) as Lead["source"][])
      .map((k) => ({
        name: SOURCE_LABELS[k],
        value: counts[k],
        color: SOURCE_COLORS[k],
      }))
      .filter((s) => s.value > 0);
  }, [filteredLeads]);

  /* --- Recent activity (last 10, newest first) --- */
  const recent = useMemo(
    () =>
      [...filteredActivity]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 10),
    [filteredActivity],
  );

  return (
    <main>
      {/* HERO BAND */}
      <section className="relative overflow-hidden border-b border-[#E5ECF4]">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 480px at 14% 0%, rgba(47,143,204,0.10), transparent 60%), radial-gradient(800px 480px at 92% 100%, rgba(15,76,129,0.08), transparent 65%), linear-gradient(180deg, #FCFDFE 0%, #F1F5FA 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Pipeline analytics
              </span>
              <h1 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
                Sales Pipeline Dashboard.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-mhsp-muted leading-relaxed max-w-2xl">
                Live performance across your virtual sales team.
              </p>
            </div>

            {/* Date range selector */}
            <div className="relative shrink-0">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as Range)}
                aria-label="Date range"
                className="pl-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-[0.12em]"
              >
                {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
                  <option key={r} value={r}>
                    {RANGE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* KPI GRID + CHARTS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {!hydrated ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* 6 KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Kpi
                Icon={ActivityIcon}
                tone="navy"
                label="Agent runs"
                value={stats.totalRuns.toString()}
                hint={RANGE_LABELS[range]}
              />
              <Kpi
                Icon={Users}
                tone="teal"
                label="Leads generated"
                value={stats.leadsCount.toString()}
                hint={RANGE_LABELS[range]}
              />
              <Kpi
                Icon={Mail}
                tone="teal"
                label="Emails queued"
                value={stats.emailsCount.toString()}
                hint={RANGE_LABELS[range]}
              />
              <Kpi
                Icon={CalendarClock}
                tone="navy"
                label="Sequences scheduled"
                value={stats.sequences.toString()}
                hint="Coming soon"
              />
              <Kpi
                Icon={Crosshair}
                tone="navy"
                label="Calculated funnel"
                value={stats.calcPct}
                hint="Share of runs"
                highlight
              />
              <Kpi
                Icon={Zap}
                tone="teal"
                label="Hustle funnel"
                value={stats.hustlePct}
                hint="Share of runs"
                highlight
              />
            </div>

            {/* Activity by agent — horizontal bar */}
            <Card title="Activity by agent" subtitle={`Runs ${RANGE_LABELS[range].toLowerCase()}`}>
              {activityByAgent.length === 0 ? (
                <EmptyInline
                  message="No agent runs yet."
                  ctaHref="/agent/01_director"
                  ctaLabel="Start with the Director of Sales"
                />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(220, activityByAgent.length * 38)}
                  minWidth={0}
                >
                  <BarChart
                    data={activityByAgent}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
                  >
                    <XAxis
                      type="number"
                      hide
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{
                        fill: "#0F4C81",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(27,110,183,0.06)" }}
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E5ECF4",
                        borderRadius: 12,
                        fontSize: 14,
                        boxShadow:
                          "0 12px 30px -12px rgba(15,76,129,0.20)",
                      }}
                      labelStyle={{ fontWeight: 700, color: "#0F4C81" }}
                    />
                    <Bar
                      dataKey="runs"
                      radius={[0, 8, 8, 0]}
                      animationDuration={650}
                    >
                      {activityByAgent.map((d) => (
                        <Cell
                          key={d.id}
                          fill={d.funnel === "calculated" ? "#0F4C81" : "#2F8FCC"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Two donut charts side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card
                title="Lead status"
                subtitle="Distribution by current stage"
              >
                {statusData.length === 0 ? (
                  <EmptyInline
                    message="No leads yet."
                    ctaHref="/agent/02_lead_gen"
                    ctaLabel="Open Lead Generation"
                  />
                ) : (
                  <DonutChart data={statusData} />
                )}
              </Card>
              <Card
                title="Lead source"
                subtitle="Where leads came from"
              >
                {sourceData.length === 0 ? (
                  <EmptyInline
                    message="No leads to attribute."
                    ctaHref="/leads"
                    ctaLabel="Open Lead Manager"
                  />
                ) : (
                  <DonutChart data={sourceData} />
                )}
              </Card>
            </div>

            {/* Recent activity feed */}
            <Card
              title="Recent activity"
              subtitle="Latest 10 entries — click to jump in"
            >
              {recent.length === 0 ? (
                <EmptyInline
                  message="Nothing in the log for this window."
                  ctaHref="/"
                  ctaLabel="Go to homepage"
                />
              ) : (
                <ul className="divide-y divide-[#F1F4F8]">
                  {recent.map((e, i) => (
                    <ActivityRow key={e.id} entry={e} index={i} />
                  ))}
                </ul>
              )}
            </Card>

            {/* ── Team Chat + Tasks + Backyard Hunter dashboard cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/team-chat" className="group block rounded-2xl border border-[#E5ECF4] bg-white shadow-[0_4px_16px_-8px_rgba(15,76,129,0.10)] hover:shadow-[0_8px_24px_-8px_rgba(15,76,129,0.18)] transition-all p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] flex items-center justify-center text-white shadow-[0_6px_16px_-8px_rgba(15,76,129,0.5)]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-mhsp-navy">Team Chat Activity</p>
                    <p className="text-xs text-mhsp-muted">{chatMsgCount} messages today</p>
                  </div>
                </div>
                {lastChatAgent && (
                  <p className="text-sm text-mhsp-muted mb-3">Last: {lastChatAgent.name} at {lastChatAgent.time}</p>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B6EB7] group-hover:text-[#0F4C81] transition-colors">
                  Open Team Chat <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>

              <Link href="/tasks" className="group block rounded-2xl border border-[#E5ECF4] bg-white shadow-[0_4px_16px_-8px_rgba(15,76,129,0.10)] hover:shadow-[0_8px_24px_-8px_rgba(15,76,129,0.18)] transition-all p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A537] to-[#B8922E] flex items-center justify-center text-white shadow-[0_6px_16px_-8px_rgba(212,165,55,0.4)]">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-mhsp-navy">Active Tasks</p>
                    <p className="text-xs text-mhsp-muted">
                      {taskStats.inProgress} in progress · {taskStats.overdue} overdue · {taskStats.done} done
                    </p>
                  </div>
                </div>
                {taskStats.topAgent && (
                  <p className="text-sm text-mhsp-muted line-clamp-1 mb-3">{taskStats.topAgent}</p>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B6EB7] group-hover:text-[#0F4C81] transition-colors">
                  Open Task Board <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>

              <Link href="/backyard-hunter" className="group block rounded-2xl border border-[#E5ECF4] bg-white shadow-[0_4px_16px_-8px_rgba(15,76,129,0.10)] hover:shadow-[0_8px_24px_-8px_rgba(15,76,129,0.18)] transition-all p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#1B6EB7] flex items-center justify-center text-white shadow-[0_6px_16px_-8px_rgba(15,76,129,0.4)]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-mhsp-navy">Backyard Hunter</p>
                    <p className="text-xs text-mhsp-muted">
                      {backyardStats ? `${backyardStats.total} businesses · ${backyardStats.hot} hot` : "Dallas 15mi radius"}
                    </p>
                  </div>
                </div>
                {backyardStats && (
                  <p className="text-sm text-mhsp-muted line-clamp-1 mb-3 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    {backyardStats.top}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B6EB7] group-hover:text-[#0F4C81] transition-colors">
                  Open Backyard Hunter <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* ============================================================ */

function Kpi({
  Icon,
  tone,
  label,
  value,
  hint,
  highlight = false,
}: {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: "navy" | "teal";
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  const tile =
    tone === "navy"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_8px_28px_-12px_rgba(15,76,129,0.14),0_2px_8px_-4px_rgba(15,76,129,0.06)] ${
        highlight
          ? "border-[#DCE5EF] bg-gradient-to-br from-[#F4F8FC] via-white to-white"
          : "border-[#E5ECF4] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
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
          {hint && (
            <p className="mt-1.5 text-sm text-mhsp-muted/85">{hint}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5ECF4] bg-white shadow-[0_8px_28px_-12px_rgba(15,76,129,0.10),0_2px_8px_-4px_rgba(15,76,129,0.04)] overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#F1F4F8]">
        <h2 className="font-heading text-base sm:text-lg font-bold text-mhsp-navy">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-mhsp-muted">{subtitle}</p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function DonutChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-center">
      <div className="relative h-[200px] min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="92%"
              paddingAngle={2}
              dataKey="value"
              stroke="white"
              strokeWidth={2}
              animationDuration={650}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid #E5ECF4",
                borderRadius: 12,
                fontSize: 14,
                boxShadow: "0 12px 30px -12px rgba(15,76,129,0.20)",
              }}
              labelStyle={{ fontWeight: 700, color: "#0F4C81" }}
              formatter={(v, name) => {
                const n = typeof v === "number" ? v : Number(v) || 0;
                return [
                  `${n} (${total > 0 ? Math.round((n / total) * 100) : 0}%)`,
                  String(name),
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-numeric font-bold text-2xl text-mhsp-navy leading-none">
            {total}
          </span>
          <span className="mt-1 text-sm text-mhsp-muted">total</span>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-mhsp-text">{d.name}</span>
            <span className="ml-auto font-numeric font-bold text-mhsp-navy">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityRow({
  entry,
  index,
}: {
  entry: ActivityEntry;
  index: number;
}) {
  const isRun = entry.type === "agent_run";
  const agent = isRun ? getAgent(entry.agentId) : undefined;
  const title = isRun
    ? entry.agentName
    : `Email queued — ${entry.subject}`;
  const href = isRun ? `/agent/${entry.agentId}` : "/activity";
  const funnel = agent?.funnel;
  const tile =
    funnel === "calculated"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : funnel === "hustle"
        ? "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]"
        : "bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81]";

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 py-3.5 group hover:bg-[#F8FAFC] transition-colors -mx-5 sm:-mx-6 px-5 sm:px-6"
        style={{ animationDelay: `${index * 25}ms` }}
      >
        <div
          className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-[0_6px_16px_-8px_rgba(15,76,129,0.5)] ${tile}`}
        >
          {isRun ? (
            <ActivityIcon className="h-4 w-4" strokeWidth={2.25} />
          ) : (
            <Mail className="h-4 w-4" strokeWidth={2.25} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-mhsp-navy leading-tight truncate">
            {title}
          </p>
          {entry.preview && (
            <p className="mt-0.5 text-sm text-mhsp-muted leading-snug line-clamp-1">
              {entry.preview}
            </p>
          )}
        </div>
        <span className="shrink-0 text-sm text-mhsp-muted font-numeric whitespace-nowrap">
          {timeAgoShort(entry.timestamp)}
        </span>
        <ArrowRight className="shrink-0 h-4 w-4 text-mhsp-muted/60 group-hover:text-[#1B6EB7] group-hover:translate-x-0.5 transition-all" />
      </Link>
    </li>
  );
}

function EmptyInline({
  message,
  ctaHref,
  ctaLabel,
}: {
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="text-center py-10">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] text-white shadow-[0_8px_22px_-8px_rgba(27,110,183,0.5)]">
        <Sparkles className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <p className="mt-3 text-sm font-semibold text-mhsp-navy">{message}</p>
      <Link
        href={ctaHref}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.12em] text-[#1B6EB7] hover:text-[#0F4C81] transition-colors group"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function timeAgoShort(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
