import {
  Crosshair,
  Zap,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const CALCULATED = {
  bullets: [
    "Identifies enterprise corporate accounts",
    "Responds to RFPs in under 24 hours",
    "Negotiates LNR rates with big spenders",
    "Manages top-account relationships",
    "Reports to ownership weekly",
  ],
  agentCount: 6,
  bestFor: "Hotels chasing $1M+ in big-account revenue",
};

const HUSTLE = {
  bullets: [
    "Hunts local medical, construction, sports leads",
    "Builds group room blocks for community events",
    "Pitches meeting + catering opportunities",
    "Mines repeat-stay opportunities",
    "Wins back lapsed local accounts",
  ],
  agentCount: 5,
  bestFor: "Hotels filling slow days with backyard wins",
};

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden">
      {/* Section background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 500px at 14% 0%, rgba(47,143,204,0.08), transparent 60%), radial-gradient(700px 400px at 86% 100%, rgba(15,76,129,0.07), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F6F9FC 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            The MHSP Method
          </span>
          <h2 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
            How my Sales TEAM AI works.
          </h2>
          <p className="mt-5 text-base sm:text-lg lg:text-[19px] text-mhsp-muted leading-relaxed">
            Donna&apos;s{" "}
            <span className="font-semibold text-mhsp-navy">
              Synergistic Selling
            </span>
            framework runs two funnels at once - and our agents work both, in
            parallel, every day.
          </p>
        </div>

        {/* Dual funnel cards */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* CALCULATED CARD */}
          <FunnelCard
            tone="navy"
            Icon={Crosshair}
            funnel="Calculated"
            tagline="Big revenue. Top accounts."
            description="Brand-level precision. Direct relationships with the accounts that matter most. Big spends, long contracts, steady revenue."
            bullets={CALCULATED.bullets}
            agentCount={CALCULATED.agentCount}
            bestFor={CALCULATED.bestFor}
          />

          {/* HUSTLE CARD */}
          <FunnelCard
            tone="teal"
            Icon={Zap}
            funnel="Hustle"
            tagline="Local. Grassroots. Backyard."
            description="First one to convert wins. Medical, sports, construction, weddings, repeat stays - all the backyard revenue most hotels miss."
            bullets={HUSTLE.bullets}
            agentCount={HUSTLE.agentCount}
            bestFor={HUSTLE.bestFor}
          />

          {/* Centre "+" badge - desktop only */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="h-12 w-12 rounded-full bg-white border border-[#E5ECF4] flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(15,76,129,0.20)]">
              <span className="font-numeric text-2xl font-bold bg-gradient-to-br from-[#1B6EB7] to-[#0F4C81] bg-clip-text text-transparent">
                +
              </span>
            </div>
          </div>
        </div>

        {/* Synergy summary */}
        <div className="mt-12 sm:mt-16 max-w-3xl mx-auto text-center">
          <p className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold leading-[1.2] text-mhsp-navy">
            Together, that&apos;s{" "}
            <span className="gradient-italic bg-gradient-to-r from-[#1B6EB7] to-[#2F8FCC] bg-clip-text text-transparent italic">
              Synergistic Selling
            </span>
          </p>
          <p className="mt-2 text-base sm:text-lg text-mhsp-muted leading-relaxed">
            the MHSP method, on autopilot, every day.
          </p>
          <Link
            href="/agents"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#1B6EB7] hover:text-[#0F4C81] transition-colors group whitespace-nowrap"
          >
            Meet the 11 specialists
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FunnelCard({
  tone,
  Icon,
  funnel,
  tagline,
  description,
  bullets,
  agentCount,
  bestFor,
}: {
  tone: "navy" | "teal";
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  funnel: string;
  tagline: string;
  description: string;
  bullets: string[];
  agentCount: number;
  bestFor: string;
}) {
  const tile =
    tone === "navy"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";

  const checkColor = tone === "navy" ? "text-mhsp-navy" : "text-mhsp-teal";
  const stripGradient =
    tone === "navy"
      ? "from-[#0F4C81] via-[#1B6EB7] to-[#0F4C81]"
      : "from-[#2F8FCC] via-[#1B6EB7] to-[#2F8FCC]";

  return (
    <div className="relative bg-white rounded-2xl border border-[#E5ECF4] overflow-hidden shadow-[0_30px_60px_-30px_rgba(15,76,129,0.18),0_8px_20px_-8px_rgba(15,76,129,0.08)] hover:shadow-[0_40px_80px_-30px_rgba(15,76,129,0.25),0_12px_28px_-8px_rgba(15,76,129,0.12)] transition-shadow">
      {/* Top accent strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${stripGradient}`} />

      <div className="p-6 sm:p-8 lg:p-10">
        {/* Icon + funnel badge */}
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-[0_6px_20px_-8px_rgba(15,76,129,0.55)] ${tile}`}
          >
            <Icon className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-mhsp-gold">
              The {funnel} Funnel
            </p>
            <p className="font-numeric text-sm font-semibold text-mhsp-muted/85 mt-0.5">
              {agentCount} {agentCount === 1 ? "agent" : "agents"} on this
              funnel
            </p>
          </div>
        </div>

        {/* Tagline */}
        <h3 className="font-heading mt-6 text-[26px] sm:text-3xl lg:text-[32px] font-bold leading-tight text-mhsp-navy">
          {tagline}
        </h3>
        <p className="mt-3 text-base text-mhsp-muted leading-relaxed">
          {description}
        </p>

        {/* Bullets */}
        <ul className="mt-7 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span
                className={`shrink-0 mt-0.5 h-5 w-5 rounded-full bg-[#EAF2FA] ${checkColor} flex items-center justify-center`}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-base text-mhsp-text leading-relaxed">
                {b}
              </span>
            </li>
          ))}
        </ul>

        {/* Best-for footer */}
        <div className="mt-8 pt-6 border-t border-[#E5ECF4]">
          <p className="text-sm font-semibold tracking-[0.16em] uppercase text-mhsp-muted">
            Best for
          </p>
          <p className="mt-1.5 text-base font-semibold text-mhsp-navy">
            {bestFor}
          </p>
        </div>
      </div>
    </div>
  );
}
