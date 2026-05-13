import Link from "next/link";
import { ArrowRight, Sparkles, Crosshair, Zap } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { iconForAgent } from "@/lib/agent-icons";

export function TeamPreview() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft section background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 480px at 50% 0%, rgba(47,143,204,0.06), transparent 60%), linear-gradient(180deg, #FBFCFE 0%, #F1F5FA 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Your AI workforce
          </span>
          <h2 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
            Meet your AI sales team.
          </h2>
          <p className="mt-5 text-base sm:text-lg lg:text-[19px] text-mhsp-muted leading-relaxed">
            One Director of Sales plus 5 specialists, each trained on the MHSP
            methodology and ready to work the moment you describe your hotel.
          </p>
        </div>

        {/* All 6 agents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {AGENTS.map((agent, i) => (
            <AgentTeamCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>

        {/* CTA below */}
        <div className="mt-12 text-center">
          <Link
            href="/agents"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.6)] hover:-translate-y-0.5 transition-all"
          >
            Open the team workspace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function AgentTeamCard({
  agent,
  index,
}: {
  agent: (typeof AGENTS)[number];
  index: number;
}) {
  const Icon = iconForAgent(agent.id);
  const isCalculated = agent.funnel === "calculated";

  const iconTile = isCalculated
    ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
    : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";

  const FunnelIcon = isCalculated ? Crosshair : Zap;
  const cleanName = agent.realName;

  return (
    <Link
      href={`/agent/${agent.id}`}
      className="group relative bg-white rounded-2xl border border-[#E5ECF4] p-6 hover:border-[#C9DAEB] hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(15,76,129,0.20)] transition-all overflow-hidden"
      style={{
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Decorative accent dot top-right */}
      <span
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: isCalculated
            ? "radial-gradient(closest-side, #0F4C81, transparent)"
            : "radial-gradient(closest-side, #2F8FCC, transparent)",
        }}
      />

      {/* Header row: icon tile + status chip */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-[0_6px_20px_-8px_rgba(15,76,129,0.5)] ${iconTile}`}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} />
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold tracking-wider uppercase bg-mhsp-success/10 text-mhsp-success border border-mhsp-success/30"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
          Online
        </span>
      </div>

      {/* Role title (eyebrow) */}
      <p className="mt-5 text-sm font-bold tracking-[0.16em] uppercase text-mhsp-gold">
        {agent.designation}
      </p>

      {/* Name */}
      <h3 className="font-heading mt-1.5 text-[22px] font-bold leading-tight text-mhsp-navy">
        {cleanName}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm text-mhsp-muted leading-relaxed line-clamp-3">
        {agent.description}
      </p>

      {/* Footer: funnel chip + arrow */}
      <div className="mt-5 pt-5 border-t border-[#E5ECF4] flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-[0.14em] uppercase ${
            isCalculated ? "text-mhsp-navy" : "text-mhsp-teal"
          }`}
        >
          <FunnelIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {isCalculated ? "Calculated" : "Hustle"}
        </span>
        <ArrowRight className="h-4 w-4 text-mhsp-muted/70 group-hover:text-mhsp-navy group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
