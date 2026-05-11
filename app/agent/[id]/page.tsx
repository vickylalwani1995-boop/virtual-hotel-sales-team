"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { getAgent } from "@/lib/agents";
import { AgentChat } from "@/components/AgentChat";
import { ArrowLeft } from "lucide-react";

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

function labelFromName(name: string) {
  return name.replace(/\s+Agent$/i, "").toUpperCase();
}

function AgentDetail({ id }: { id: string }) {
  const agent = getAgent(id);
  const searchParams = useSearchParams();
  const profileParam = searchParams.get("profile") ?? "";
  const profile =
    profileParam ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("vhst-hotel-profile") ?? ""
      : "");

  if (!agent) return notFound();

  const gradient = GRADIENT[agent.color] ?? GRADIENT.teal;
  const isCalculated = agent.funnel === "calculated";

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

      {/* Hero strip */}
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
        <span
          className={`absolute top-4 left-24 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-bold tracking-[0.14em] uppercase ${
            isCalculated
              ? "bg-white/15 text-white border border-white/30"
              : "bg-white/15 text-white border border-white/30"
          }`}
        >
          {isCalculated ? "🎯 Calculated" : "⚡ Hustle"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
        {/* Left - agent identity */}
        <aside>
          <div className="bg-white rounded-2xl border border-mhsp-line p-6 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
            <p className="eyebrow">{labelFromName(agent.name)}</p>
            <h1 className="font-display text-3xl text-mhsp-navy mt-2 leading-tight">
              {agent.name}
            </h1>
            <p className="text-[14px] font-semibold tracking-[0.16em] uppercase text-mhsp-gold mt-1">
              {agent.roleTitle}
            </p>
            <p className="text-sm text-mhsp-muted mt-3 leading-relaxed">
              {agent.description}
            </p>

            <div className="mt-5 pt-5 border-t border-mhsp-line/60 space-y-1.5">
              {agent.id !== "00_director_of_sales" && (
                <p className="text-sm text-mhsp-muted">
                  <span className="font-semibold text-mhsp-navy">Reports to:</span>{" "}
                  Director of Sales
                </p>
              )}
              <p className="text-sm text-mhsp-muted">
                <span className="font-semibold text-mhsp-navy">Used by:</span>{" "}
                <span className="font-numeric text-mhsp-success">1,200+</span>{" "}
                hotels nationwide
              </p>
              <p className="text-sm text-mhsp-muted">
                <span className="font-semibold text-mhsp-navy">Funnel:</span>{" "}
                {isCalculated ? "🎯 Calculated" : "⚡ Hustle"}
              </p>
            </div>

            {profile && <ProfileChips profile={profile} />}
          </div>
        </aside>

        {/* Right - chat */}
        <div>
          {!profile ? (
            <div className="bg-white rounded-2xl border border-mhsp-line border-dashed p-10 text-center">
              <p className="text-mhsp-muted text-sm">
                No hotel profile yet.{" "}
                <Link href="/" className="underline text-mhsp-navy font-medium">
                  Add one first
                </Link>{" "}
                so the agent has context.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-end">
                <Link
                  href={`/call/${agent.id}?profile=${encodeURIComponent(profile)}`}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] hover:from-[#1B6EB7] hover:to-[#0F4C81] text-white px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] shadow-[0_8px_18px_-8px_rgba(15,76,129,0.55)] hover:-translate-y-0.5 transition-all"
                  title="Start a voice call with this agent"
                >
                  <span className="text-base leading-none">📞</span>
                  Start Call
                </Link>
              </div>
              <AgentChat agent={agent} hotelProfile={profile} />
            </>
          )}
        </div>
      </div>
    </main>
  );
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
