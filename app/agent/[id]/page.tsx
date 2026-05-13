"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { getAgent } from "@/lib/agents";
import { iconForAgent } from "@/lib/agent-icons";
import { AgentChat } from "@/components/AgentChat";
import { getWelcomeAgent } from "@/lib/welcome-team";
import {
  ArrowLeft,
  Crosshair,
  Zap,
  Phone,
} from "lucide-react";

function ProfileChips({ profile }: { profile: string }) {
  const fields = [
    "Hotel Name",
    "Location",
    "Rooms",
    "Brand",
    "Average Daily Rate",
    "Current Occupancy",
    "Slow Days",
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
      <div className="mt-5 pt-5 border-t border-[#E5ECF4]">
        <p className="text-sm font-bold tracking-[0.18em] text-mhsp-gold uppercase mb-2">
          Working with
        </p>
        <p className="text-sm text-mhsp-muted leading-relaxed line-clamp-6">
          {profile}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-6 pt-6 border-t border-[#E5ECF4]">
      <p className="text-sm font-bold tracking-[0.18em] text-mhsp-gold uppercase mb-3">
        Working with
      </p>
      <dl className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5">
            <dt className="text-sm font-semibold uppercase tracking-wider text-mhsp-muted">
              {r.label}
            </dt>
            <dd className="text-sm text-mhsp-navy font-medium leading-snug break-words">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AgentDetail({ id }: { id: string }) {
  const officialAgent = getAgent(id);

  // Support custom agents from localStorage
  const agent: typeof officialAgent = officialAgent ?? (() => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = localStorage.getItem("vhst-custom-playbooks");
      if (!raw) return undefined;
      const playbooks = JSON.parse(raw) as { metadata: { agentId: string; realName: string; designation: string; funnel: string; isCaptain?: boolean; capabilities?: string[] }; sections: { problem: string } }[];
      const pb = playbooks.find((p) => p.metadata.agentId === id);
      if (!pb) return undefined;
      return {
        id: pb.metadata.agentId,
        realName: pb.metadata.realName,
        designation: pb.metadata.designation,
        funnel: (pb.metadata.funnel === "hustle" ? "hustle" : "calculated") as "calculated" | "hustle",
        isCaptain: pb.metadata.isCaptain ?? false,
        photo: "",
        description: pb.sections.problem || pb.metadata.designation,
        capabilities: pb.metadata.capabilities || [],
        solvesProblem: pb.sections.problem || "",
      } as unknown as typeof officialAgent;
    } catch { return undefined; }
  })();

  const searchParams = useSearchParams();
  const profileParam = searchParams.get("profile") ?? "";
  const profile =
    profileParam ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("vhst-hotel-profile") ?? ""
      : "");

  if (!agent) return notFound();

  const Icon = iconForAgent(agent.id);
  const welcome = getWelcomeAgent(agent);
  const isCalculated = agent.funnel === "calculated";
  const FunnelIcon = isCalculated ? Crosshair : Zap;
  const cleanName = welcome.realName;

  const iconTile = isCalculated
    ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
    : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";

  const stripGradient = isCalculated
    ? "from-[#0F4C81] via-[#1B6EB7] to-[#0F4C81]"
    : "from-[#2F8FCC] via-[#1B6EB7] to-[#2F8FCC]";

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

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          {/* Breadcrumb */}
          <Link
            href={`/agents?profile=${encodeURIComponent(profile)}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-muted hover:text-mhsp-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sales Team
          </Link>

          {/* Agent header row */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              {welcome.photo ? (
                <div className="shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl overflow-hidden ring-2 ring-[#D6E3F0] shadow-[0_10px_24px_-10px_rgba(15,76,129,0.45)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={welcome.photo} alt={welcome.realName} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div
                  className={`shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_24px_-8px_rgba(15,76,129,0.55)] ${iconTile}`}
                >
                  <Icon
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    strokeWidth={2.25}
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-[0.18em] uppercase text-mhsp-gold">
                  {welcome.designation}
                </p>
                <h1 className="font-heading mt-1 text-[28px] sm:text-[36px] lg:text-[44px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
                  {cleanName}
                </h1>
                {/* Funnel + status chips */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-bold uppercase tracking-wider ${
                      isCalculated
                        ? "bg-[#EAF2FA] text-[#0F4C81] border-[#C9DAEB]"
                        : "bg-[#E3F1FA] text-[#1B6EB7] border-[#C7DFEE]"
                    }`}
                  >
                    <FunnelIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                    {isCalculated ? "Calculated" : "Hustle"}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-bold uppercase tracking-wider bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Start Call CTA — desktop only on right */}
            {profile && (
              <Link
                href={`/call/${agent.id}?profile=${encodeURIComponent(profile)}`}
                className="group shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-5 sm:px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.55)] hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.65)] hover:-translate-y-0.5 transition-all"
                title="Start a voice call with this agent"
              >
                <Phone className="h-4 w-4" />
                Start Call
              </Link>
            )}
          </div>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-mhsp-muted leading-relaxed max-w-3xl">
            {agent.description}
          </p>
        </div>

        {/* Bottom accent strip */}
        <div className={`h-1 w-full bg-gradient-to-r ${stripGradient}`} />
      </section>

      {/* ============= MAIN GRID ============= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.85fr)] gap-5 sm:gap-6">
          {/* Left — agent identity card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl border border-[#E5ECF4] p-5 sm:p-6 shadow-[0_8px_28px_-14px_rgba(15,76,129,0.14),0_2px_8px_-4px_rgba(15,76,129,0.06)]">
              <p className="text-sm font-bold tracking-[0.16em] uppercase text-mhsp-gold">
                About
              </p>
              <h2 className="font-heading mt-1.5 text-xl font-bold text-mhsp-navy leading-tight">
                {cleanName}
              </h2>

              <div className="mt-5 pt-5 border-t border-[#E5ECF4] space-y-2">
                {agent.id !== "01_director" && (
                  <p className="text-sm text-mhsp-muted">
                    <span className="font-semibold text-mhsp-navy">
                      Reports to:
                    </span>{" "}
                    Director of Sales
                  </p>
                )}
                <p className="text-sm text-mhsp-muted">
                  <span className="font-semibold text-mhsp-navy">
                    Used by:
                  </span>{" "}
                  <span className="font-numeric text-mhsp-success font-bold">
                    1,200+
                  </span>{" "}
                  hotels nationwide
                </p>
                <p className="text-sm text-mhsp-muted">
                  <span className="font-semibold text-mhsp-navy">Funnel:</span>{" "}
                  <span className="inline-flex items-center gap-1">
                    <FunnelIcon
                      className={`h-3 w-3 ${
                        isCalculated ? "text-mhsp-navy" : "text-mhsp-teal"
                      }`}
                      strokeWidth={2.5}
                    />
                    {isCalculated ? "Calculated" : "Hustle"}
                  </span>
                </p>
              </div>

              {profile && <ProfileChips profile={profile} />}
            </div>
          </aside>

          {/* Right — chat */}
          <div className="min-w-0">
            {!profile ? (
              <div className="bg-white rounded-2xl border border-[#E5ECF4] border-dashed p-8 sm:p-10 text-center">
                <p className="text-mhsp-muted text-base">
                  No hotel profile yet.{" "}
                  <Link
                    href="/#brief-section"
                    className="underline text-mhsp-navy font-semibold hover:text-[#1B6EB7] transition-colors"
                  >
                    Add one first
                  </Link>{" "}
                  so the agent has context.
                </p>
              </div>
            ) : (
              <AgentChat agent={agent} hotelProfile={profile} />
            )}
          </div>
        </div>
      </section>
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
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-7 w-7 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AgentDetail id={id} />
    </Suspense>
  );
}
