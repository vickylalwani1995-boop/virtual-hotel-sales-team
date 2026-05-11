"use client";

import { Suspense } from "react";
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
} from "lucide-react";
import { AGENTS } from "@/lib/agents";

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

function AgentsContent() {
  const searchParams = useSearchParams();
  const profile = searchParams.get("profile") ?? "";
  const hotelName = extractHotelName(profile);
  const chips = profileChips(profile);

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
            backgroundImage:
              "radial-gradient(rgba(15,76,129,0.7) 1px, transparent 1px)",
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
                      <span className="text-mhsp-muted font-medium">
                        {c.label}:
                      </span>
                      <span className="font-bold text-mhsp-navy">
                        {c.value}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {/* Action row */}
              {profile && (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/agent/00_director_of_sales?profile=${encodeURIComponent(profile)}`}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.6)] hover:-translate-y-0.5 transition-all"
                  >
                    Start with Director
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/activity"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-6 py-3 text-sm font-semibold transition-all"
                  >
                    <Activity className="h-4 w-4" />
                    View activity log
                  </Link>
                </div>
              )}
            </div>

            {/* RIGHT — stats panel */}
            <div className="lg:pt-2">
              <div className="bg-white rounded-2xl border border-[#E5ECF4] shadow-[0_20px_50px_-25px_rgba(15,76,129,0.20),0_4px_14px_-4px_rgba(15,76,129,0.06)] overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />
                <div className="p-5 sm:p-6">
                  <p className="text-sm font-bold tracking-[0.18em] uppercase text-mhsp-gold">
                    At a glance
                  </p>
                  <h2 className="font-heading text-xl font-bold text-mhsp-navy mt-1.5 leading-tight">
                    Your sales department.
                  </h2>

                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    <StatCell
                      value={AGENTS.length.toString()}
                      label="Total agents"
                    />
                    <StatCell
                      value={`${liveCount} / ${readyCount}`}
                      label="Live / Ready"
                      muted
                    />
                    <StatCell
                      value={calculatedCount.toString()}
                      label="🎯 Calculated"
                    />
                    <StatCell
                      value={hustleCount.toString()}
                      label="⚡ Hustle"
                    />
                  </dl>

                  <div className="mt-5 pt-5 border-t border-[#E5ECF4] flex items-center gap-2 text-sm text-mhsp-muted">
                    <Building2 className="h-4 w-4 text-[#1B6EB7]" />
                    <span>
                      Trained on the{" "}
                      <span className="font-bold text-mhsp-navy">
                        MHSP method
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= AGENT GRID ============= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        {profile ? (
          <AgentGrid profile={profile} />
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

function StatCell({
  value,
  label,
  muted = false,
}: {
  value: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#EAF2FA] bg-[#FAFCFE] px-3 py-3">
      <p
        className={`font-numeric font-bold ${
          muted ? "text-xl text-mhsp-navy/85" : "text-2xl text-mhsp-navy"
        } leading-none`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-sm text-mhsp-muted leading-tight">{label}</p>
    </div>
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
