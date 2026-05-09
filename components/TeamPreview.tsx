import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURED = [
  {
    icon: "🎯",
    name: "Director of Sales",
    role: "STRATEGY · OWNS THE PLAN",
    description: "Reads your hotel profile and ships a 30-day sales action plan.",
    stat: "30-day plan in <60s",
    gradient: "from-mhsp-navy/95 to-mhsp-navy-soft",
  },
  {
    icon: "🔍",
    name: "Lead Generation",
    role: "PROSPECTING · BUILDS LISTS",
    description: "Surfaces 15+ corporate, medical, and group leads in your market.",
    stat: "15 qualified leads",
    gradient: "from-mhsp-gold to-mhsp-gold-soft",
  },
  {
    icon: "✈️",
    name: "Outbound Sales",
    role: "OUTREACH · WRITES THE EMAILS",
    description: "Drafts cold emails, call scripts, and LinkedIn messages — ready to send.",
    stat: "3 emails per segment",
    gradient: "from-mhsp-teal to-mhsp-navy-soft",
  },
];

export function TeamPreview() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <p className="eyebrow">Your AI Workforce</p>
        <h2 className="font-display text-4xl text-mhsp-navy mt-3">
          Meet your AI sales team
        </h2>
        <p className="text-mhsp-muted mt-3 max-w-xl mx-auto">
          A Director of Sales plus 10 specialists, each trained on the MHSP
          methodology and ready to work the moment you describe your hotel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED.map((member) => (
          <div
            key={member.name}
            className="group relative bg-white rounded-2xl border border-mhsp-line overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(15,76,129,0.25)] hover:border-mhsp-gold/50"
          >
            <div
              className={`bg-gradient-to-br ${member.gradient} aspect-[5/3] flex items-center justify-center relative`}
            >
              <span className="text-7xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                {member.icon}
              </span>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
            </div>
            <div className="p-6">
              <p className="text-[14px] font-semibold tracking-[0.18em] text-mhsp-gold uppercase">
                {member.role}
              </p>
              <h3 className="font-display text-xl text-mhsp-navy mt-2">
                {member.name}
              </h3>
              <p className="text-sm text-mhsp-muted mt-2 leading-relaxed">
                {member.description}
              </p>
              <div className="mt-4 pt-4 border-t border-mhsp-line/60 flex items-center justify-between">
                <span className="font-numeric text-sm text-mhsp-navy">
                  {member.stat}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-navy hover:text-mhsp-gold transition-colors"
        >
          + 8 more specialists on the team
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
