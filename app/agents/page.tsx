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
  Crosshair,
  Zap,
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
      href: `/agent/01_director?profile=${encodeURIComponent(profile)}`,
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
    <section className="bg-white border-b border-[#E5ECF4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">
        <p className="text-center text-[11px] font-bold tracking-[0.24em] uppercase text-mhsp-muted mb-2">
          How to get started
        </p>
        <p className="text-center text-lg font-heading font-bold text-mhsp-navy mb-8">
          Three steps to your first sales action
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

          {steps.map((step, idx) => (
            <Link
              key={step.num}
              href={step.href}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6EB7] focus-visible:ring-offset-2 rounded-2xl"
            >
              <article className="relative h-full bg-[#F8FAFC] rounded-2xl border border-[#E5ECF4] group-hover:border-[#1B6EB7]/30 overflow-hidden group-hover:-translate-y-1 group-hover:shadow-[0_20px_44px_-16px_rgba(15,76,129,0.18)] transition-all duration-300">

                {/* Step number + icon header */}
                <div className="px-5 pt-5 pb-4 flex items-center gap-4">
                  <div
                    className="shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${step.gradientFrom} 0%, ${step.gradientTo} 100%)`,
                    }}
                  >
                    <step.Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-mhsp-muted/60">
                      Step {step.num}
                    </span>
                    <h3 className="font-heading text-[17px] font-bold text-mhsp-navy leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>

                {/* Content body */}
                <div className="px-5 pb-5">
                  <p className="text-sm text-mhsp-muted leading-relaxed">
                    {step.desc}
                  </p>

                  {/* CTA row */}
                  <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[#1B6EB7] group-hover:text-[#0F4C81] transition-colors">
                    {step.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Connecting line indicator */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-[10px] w-[20px] h-px bg-[#DCE5EF] pointer-events-none z-10" />
                )}
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

  const calculatedCount = AGENTS.filter((a) => a.funnel === "calculated").length;
  const hustleCount = AGENTS.filter((a) => a.funnel === "hustle").length;

  return (
    <main>
      {/* ============= HERO BAND ============= */}
      <section className="relative overflow-hidden bg-[#FBFCFE]">
        {/* Soft gradient accents */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#1B6EB7] to-transparent" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(closest-side, #1B6EB7, transparent)" }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-10 sm:pb-14">
          {/* Back link */}
          <Link
            href={`/?profile=${encodeURIComponent(profile)}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-muted hover:text-mhsp-navy transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit hotel profile
          </Link>

          {/* Centered title block */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-4 py-1.5 text-[11px] font-bold tracking-[0.22em] uppercase text-[#1B6EB7] shadow-sm mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Your AI Sales Team
            </span>

            <h1 className="font-heading text-[36px] sm:text-[48px] lg:text-[56px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
              6 Agents.
              <br />
              <span className="bg-gradient-to-r from-[#1B6EB7] to-[#2F8FCC] bg-clip-text text-transparent">
                {hotelName}.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-mhsp-muted leading-relaxed max-w-2xl mx-auto">
              Two funnels. One sales engine. Built on the MHSP method — every agent is trained,
              briefed, and ready to sell for your property.
            </p>

            {/* CTA buttons */}
            {profile && (
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/agent/01_director?profile=${encodeURIComponent(profile)}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F4C81] hover:bg-[#0A3660] text-white px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_28px_-10px_rgba(15,76,129,0.5)] hover:shadow-[0_14px_36px_-10px_rgba(15,76,129,0.65)] hover:-translate-y-0.5 transition-all"
                >
                  Start with Director
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/activity"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-6 py-3.5 text-sm font-semibold transition-all"
                >
                  <Activity className="h-4 w-4" />
                  Activity Log
                </Link>
              </div>
            )}
          </div>

          {/* Hotel context bar */}
          {profile && chips.length > 0 && (
            <div className="flex items-center justify-center gap-x-1 gap-y-2 flex-wrap rounded-2xl bg-white border border-[#E5ECF4] shadow-sm px-5 py-3.5 max-w-4xl mx-auto mb-8">
              <Building2 className="h-4 w-4 text-[#1B6EB7] mr-1 shrink-0" />
              {chips.map((c, i) => (
                <span key={c.label} className="inline-flex items-center gap-1.5 text-sm">
                  {i > 0 && <span className="text-[#DCE5EF] font-bold mx-1.5">·</span>}
                  <span className="text-mhsp-muted font-medium">{c.label}:</span>
                  <span className="font-bold text-mhsp-navy">{c.value}</span>
                </span>
              ))}
            </div>
          )}

          {/* Stats row — horizontal cards */}
          <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#1B6EB7] p-4 sm:p-5 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
              <p className="relative font-numeric text-[36px] sm:text-[42px] font-bold text-white leading-none">{AGENTS.length}</p>
              <p className="relative text-[11px] font-bold tracking-[0.16em] uppercase text-white/60 mt-1.5">Agents Online</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#E5ECF4] p-4 sm:p-5 text-center">
              <p className="font-numeric text-[36px] sm:text-[42px] font-bold text-mhsp-navy leading-none">{calculatedCount}</p>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-mhsp-muted mt-1.5 flex items-center justify-center gap-1"><Crosshair className="h-3 w-3" /> Calculated</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#E5ECF4] p-4 sm:p-5 text-center">
              <p className="font-numeric text-[36px] sm:text-[42px] font-bold text-[#2F8FCC] leading-none">{hustleCount}</p>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-mhsp-muted mt-1.5 flex items-center justify-center gap-1"><Zap className="h-3 w-3" /> Hustle</p>
            </div>
          </div>

          {/* Director quick-access strip */}
          {profile && (() => {
            const donna = getWelcomeAgent(AGENTS[0]);
            return (
              <div className="mt-6 max-w-4xl mx-auto">
                <Link
                  href={`/agent/01_director?profile=${encodeURIComponent(profile)}`}
                  className="group flex items-center gap-4 rounded-2xl bg-white border border-[#E5ECF4] hover:border-[#1B6EB7]/30 shadow-sm hover:shadow-md px-5 py-4 transition-all"
                >
                  <div className="shrink-0 h-12 w-12 rounded-full overflow-hidden ring-2 ring-[#E5ECF4] group-hover:ring-[#1B6EB7]/25 transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={donna.photo} alt={donna.realName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-mhsp-navy text-base">{donna.realName}</p>
                      <span className="inline-flex items-center rounded-full bg-[#0F4C81] text-white text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5">Captain</span>
                    </div>
                    <p className="text-sm text-mhsp-muted mt-0.5">{donna.designation} — routes you to the right agent for any task</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    {AGENTS.slice(1, 5).map((a) => {
                      const m = getWelcomeAgent(a);
                      return (
                        <div key={a.id} className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-[#E5ECF4] -ml-2 first:ml-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.photo} alt={m.realName} className="h-full w-full object-cover" />
                        </div>
                      );
                    })}
                    <span className="text-[11px] font-bold text-mhsp-muted ml-1">+{AGENTS.length - 4} more</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-mhsp-muted group-hover:text-[#1B6EB7] transition-colors shrink-0" />
                </Link>
              </div>
            );
          })()}
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
