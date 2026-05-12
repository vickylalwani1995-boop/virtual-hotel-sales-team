"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AgentGrid } from "@/components/AgentGrid";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  MapPin,
  Bed,
  DollarSign,
  TrendingUp,
  Award,
  Activity,
  MousePointerClick,
  GitBranch,
  MessageSquare,
} from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { getWelcomeAgent } from "@/lib/welcome-team";

function extractHotelName(profile: string): string {
  const m = profile.match(/Hotel\s*Name\s*:\s*([^\n]+)/i);
  if (m) return m[1].trim();
  const firstLine = profile.split("\n")[0]?.trim() ?? "";
  return firstLine.length > 0 && firstLine.length < 60 ? firstLine : "your hotel";
}

const CHIP_FIELDS = [
  { key: "Location", icon: MapPin },
  { key: "Rooms", icon: Bed },
  { key: "Average Daily Rate", icon: DollarSign, shortLabel: "ADR" },
  { key: "Current Occupancy", icon: TrendingUp, shortLabel: "Occupancy" },
  { key: "Brand", icon: Award },
] as const;

function profileChips(
  profile: string,
): { label: string; value: string; Icon: React.ComponentType<{ className?: string }> }[] {
  const out: { label: string; value: string; Icon: React.ComponentType<{ className?: string }> }[] = [];
  for (const f of CHIP_FIELDS) {
    const re = new RegExp(`${f.key}\\s*:\\s*([^\\n]+)`, "i");
    const m = profile.match(re);
    if (m) {
      out.push({
        label: ("shortLabel" in f && f.shortLabel) ? f.shortLabel : f.key,
        value: m[1].trim(),
        Icon: f.icon,
      });
    }
  }
  return out;
}

function GuidedFlowStrip({ profile }: { profile: string }) {
  const steps = [
    {
      num: "01",
      eyebrow: "Your first move",
      title: "Start with Director",
      desc: "Get the weekly sales plan and let the Director route you to the right agent.",
      href: `/agent/00_director_of_sales?profile=${encodeURIComponent(profile)}`,
      cta: "Open Director",
      Icon: MousePointerClick,
      gradientFrom: "#0F4C81",
      gradientTo: "#1B6EB7",
    },
    {
      num: "02",
      eyebrow: "Pick your path",
      title: "Choose a Funnel",
      desc: "Calculated for big corporate accounts. Hustle for local and backyard demand.",
      href: "#funnels",
      cta: "See funnels",
      Icon: GitBranch,
      gradientFrom: "#1B6EB7",
      gradientTo: "#2283BE",
    },
    {
      num: "03",
      eyebrow: "Take action",
      title: "Chat with an Agent",
      desc: "Ask, generate, download, and act on real sales intelligence — in seconds.",
      href: "#funnels",
      cta: "Browse agents",
      Icon: MessageSquare,
      gradientFrom: "#1E6FAD",
      gradientTo: "#2F8FCC",
    },
  ];

  return (
    <section className="border-y border-[#E5ECF4] bg-[#F1F5FA]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10">
        <p className="text-center text-sm font-bold tracking-[0.2em] uppercase text-mhsp-muted mb-6">
          How to get started
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 relative">
          {/* Connecting arrow line — desktop only */}
          <div
            className="hidden sm:block absolute top-[56px] left-[calc(33.33%-12px)] right-[calc(33.33%-12px)] h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(27,110,183,0.25) 20%, rgba(27,110,183,0.25) 80%, transparent)",
            }}
          />

          {steps.map((step) => (
            <Link
              key={step.num}
              href={step.href}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6EB7] focus-visible:ring-offset-2 rounded-2xl"
            >
              <article className="relative h-full bg-white rounded-2xl border border-[#E5ECF4] group-hover:border-[#1B6EB7]/30 overflow-hidden shadow-[0_6px_24px_-12px_rgba(15,76,129,0.14)] group-hover:shadow-[0_20px_44px_-16px_rgba(15,76,129,0.22)] group-hover:-translate-y-1 transition-all duration-300">

                {/* Gradient image header */}
                <div
                  className="relative px-5 pt-5 pb-6 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${step.gradientFrom} 0%, ${step.gradientTo} 100%)`,
                  }}
                >
                  {/* Dot-grid texture overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />
                  {/* Soft radial highlight */}
                  <div
                    className="absolute -top-6 -right-6 h-28 w-28 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(closest-side, rgba(255,255,255,0.12), transparent)",
                    }}
                  />

                  {/* Step number + icon row */}
                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className="font-numeric font-bold leading-none select-none"
                      style={{ fontSize: 56, color: "rgba(255,255,255,0.15)" }}
                    >
                      {step.num}
                    </span>
                    <div className="shrink-0 h-11 w-11 rounded-xl border border-white/20 bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(0,0,0,0.2)]">
                      <step.Icon
                        className="h-5 w-5 text-white"
                        strokeWidth={2.25}
                      />
                    </div>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5">
                  <p className="text-sm font-bold tracking-[0.15em] uppercase text-mhsp-muted">
                    {step.eyebrow}
                  </p>
                  <h3 className="font-heading text-[18px] font-bold text-mhsp-navy mt-1 leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-mhsp-muted leading-relaxed">
                    {step.desc}
                  </p>

                  {/* CTA row */}
                  <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[#1B6EB7] group-hover:text-[#0F4C81] transition-colors">
                    {step.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsContent() {
  const searchParams = useSearchParams();
  const profile = searchParams.get("profile") ?? "";
  const hotelName = extractHotelName(profile);
  const chips = profileChips(profile);

  useEffect(() => {
    if (!profile || typeof window === "undefined") return;
    window.localStorage.setItem("vhst-hotel-profile", profile);
  }, [profile]);

  const liveCount = AGENTS.filter((a) => a.tier === 1).length;
  const readyCount = AGENTS.length - liveCount;
  const calculatedCount = AGENTS.filter((a) => a.funnel === "calculated").length;
  const hustleCount = AGENTS.filter((a) => a.funnel === "hustle").length;

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
            backgroundImage: "radial-gradient(rgba(15,76,129,0.7) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          {/* Back link */}
          <Link
            href={`/?profile=${encodeURIComponent(profile)}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-muted hover:text-mhsp-navy transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit hotel profile
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-start">
            {/* LEFT — title + hotel */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Your AI sales team
              </span>

              <h1 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
                Built for
                <br />
                <span className="gradient-italic bg-gradient-to-r from-[#1B6EB7] to-[#2F8FCC] bg-clip-text text-transparent italic">
                  {hotelName}
                </span>
                .
              </h1>

              <p className="mt-5 text-base sm:text-lg text-mhsp-muted leading-relaxed max-w-xl">
                Eleven specialist agents trained on the MHSP method.
                Calculated + hustle, working both funnels for your hotel —
                ready the moment you click in.
              </p>

              {/* Hotel profile chips */}
              {profile && chips.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <span
                      key={c.label}
                      className="inline-flex items-center gap-2 rounded-full border border-[#DCE5EF] bg-white px-3 py-1.5 text-sm shadow-[0_2px_8px_-4px_rgba(15,76,129,0.10)]"
                    >
                      <c.Icon className="h-3.5 w-3.5 text-[#1B6EB7]" />
                      <span className="text-mhsp-muted font-medium">{c.label}:</span>
                      <span className="font-bold text-mhsp-navy">{c.value}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Action row */}
              {profile && (
                <div className="mt-8 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/agent/00_director_of_sales?profile=${encodeURIComponent(profile)}`}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_12px_28px_-10px_rgba(27,110,183,0.55)] hover:shadow-[0_16px_36px_-10px_rgba(15,76,129,0.65)] hover:-translate-y-0.5 transition-all"
                    >
                      Start with Director
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/activity"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-6 py-3.5 text-sm font-semibold transition-all"
                    >
                      <Activity className="h-4 w-4" />
                      View activity log
                    </Link>
                  </div>
                  <p className="text-sm text-mhsp-muted">
                    <span className="font-semibold text-mhsp-navy">Best place to begin:</span>{" "}
                    Director of Sales will route you to the right agent.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — stats panel + Donna card */}
            <div className="lg:pt-2 space-y-4">
              {/* At a glance card */}
              <div className="bg-white rounded-2xl border border-[#E5ECF4] shadow-[0_20px_50px_-25px_rgba(15,76,129,0.20),0_4px_14px_-4px_rgba(15,76,129,0.06)] overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />
                <div className="p-5 sm:p-6">
                  <p className="text-sm font-bold tracking-[0.18em] uppercase text-mhsp-gold">
                    At a glance
                  </p>
                  <h2 className="font-heading text-xl font-bold text-mhsp-navy mt-1.5 leading-tight">
                    Your sales department.
                  </h2>

                  <div className="mt-5 space-y-2.5">
                    {/* Hero stat — total agents */}
                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#0F4C81] to-[#1E5896] px-4 py-3.5">
                      <span className="text-sm font-bold text-white/70 uppercase tracking-[0.14em]">
                        Total agents
                      </span>
                      <span className="font-numeric text-3xl font-bold text-white leading-none">
                        {AGENTS.length}
                      </span>
                    </div>

                    {/* Live / Ready split */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-[#EAF2FA] bg-[#FAFCFE] px-4 py-3 flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-mhsp-success shrink-0 shadow-[0_0_0_3px_rgba(21,128,61,0.14)] animate-pulse" />
                        <div>
                          <p className="font-numeric text-2xl font-bold text-mhsp-success leading-none">
                            {liveCount}
                          </p>
                          <p className="text-sm text-mhsp-muted mt-0.5">Live</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-[#EAF2FA] bg-[#FAFCFE] px-4 py-3 flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-mhsp-gold shrink-0 shadow-[0_0_0_3px_rgba(27,110,183,0.14)]" />
                        <div>
                          <p className="font-numeric text-2xl font-bold text-mhsp-navy/75 leading-none">
                            {readyCount}
                          </p>
                          <p className="text-sm text-mhsp-muted mt-0.5">Ready</p>
                        </div>
                      </div>
                    </div>

                    {/* Funnel split */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-[#EAF2FA] bg-[#FAFCFE] px-4 py-3">
                        <p className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-navy/50 mb-1.5">
                          🎯 Calculated
                        </p>
                        <p className="font-numeric text-2xl font-bold text-mhsp-navy leading-none">
                          {calculatedCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#EAF2FA] bg-[#FAFCFE] px-4 py-3">
                        <p className="text-sm font-bold tracking-[0.12em] uppercase text-mhsp-teal/70 mb-1.5">
                          ⚡ Hustle
                        </p>
                        <p className="font-numeric text-2xl font-bold text-mhsp-navy leading-none">
                          {hustleCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-[#E5ECF4] flex items-center gap-2 text-sm text-mhsp-muted">
                    <Building2 className="h-4 w-4 text-[#1B6EB7]" />
                    <span>
                      Trained on the{" "}
                      <span className="font-bold text-mhsp-navy">MHSP method</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Director spotlight card */}
              <div className="bg-white rounded-2xl border border-[#E5ECF4] shadow-[0_8px_28px_-14px_rgba(15,76,129,0.12)] overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />
                <div className="p-5">
                  <div className="relative rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#1B6EB7] p-4 mb-4 overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-[0.06] pointer-events-none"
                      style={{
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
                        backgroundSize: "14px 14px",
                      }}
                    />
                    <p className="relative text-sm font-bold tracking-[0.16em] uppercase text-white/70">
                      Director Spotlight
                    </p>
                    <div className="relative mt-3 flex items-center gap-3">
                      {(() => {
                        const donna = getWelcomeAgent(AGENTS[0]);
                        return (
                          <>
                            <div className="h-14 w-14 rounded-full overflow-hidden ring-2 ring-white/30">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={donna.photo} alt={donna.realName} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <p className="text-white text-base font-bold">{donna.realName}</p>
                              <p className="text-white/75 text-sm">{donna.jobTitle}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="relative mt-4 grid grid-cols-3 gap-2">
                      {AGENTS.slice(1, 4).map((agent) => {
                        const member = getWelcomeAgent(agent);
                        return (
                          <div key={agent.id} className="rounded-lg bg-white/10 border border-white/20 px-2 py-2 text-center">
                            <div className="mx-auto h-8 w-8 rounded-full overflow-hidden ring-1 ring-white/30">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={member.photo} alt={member.realName} className="h-full w-full object-cover" />
                            </div>
                            <p className="mt-1 text-[10px] text-white/80 truncate">{member.realName}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-sm font-bold tracking-[0.16em] uppercase text-mhsp-gold">
                    Meet Donna
                  </p>
                  <h3 className="font-heading text-lg font-bold text-mhsp-navy mt-1 leading-tight">
                    Your AI Sales Host
                  </h3>
                  <p className="mt-1 text-sm text-mhsp-muted">
                    Start with the Director of Sales for weekly priorities, then branch into the right specialist.
                  </p>
                  <Link
                    href={profile ? `/agent/00_director_of_sales?profile=${encodeURIComponent(profile)}` : "/#start"}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-[#F4F8FC] hover:bg-[#E8F0F9] text-mhsp-navy px-4 py-2.5 text-sm font-bold transition-colors"
                  >
                    Open Director Chat
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= GUIDED FLOW STRIP ============= */}
      {profile && <GuidedFlowStrip profile={profile} />}

      {/* ============= AGENT GRID ============= */}
      <section
        id="funnels"
        className="bg-[#F7F9FC]"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
          {profile ? (
            <AgentGrid profile={profile} />
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="relative bg-white rounded-2xl border border-[#E5ECF4] border-dashed px-6 py-14 text-center max-w-2xl mx-auto">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] text-white shadow-[0_8px_24px_-8px_rgba(27,110,183,0.5)] mb-4">
        <Building2 className="h-6 w-6" strokeWidth={2.25} />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-mhsp-navy">
        No hotel profile yet.
      </h3>
      <p className="mt-2 text-mhsp-muted text-base leading-relaxed">
        Add a profile and your AI sales team will be ready in 60 seconds.
      </p>
      <Link
        href="/#start"
        className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:-translate-y-0.5 transition-all"
      >
        Add hotel profile
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AgentsContent />
    </Suspense>
  );
}
