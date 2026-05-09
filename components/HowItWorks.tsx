const CALCULATED_BULLETS = [
  "Identifies enterprise corporate accounts",
  "Responds to RFPs in <24 hours",
  "Negotiates LNR rates with big spenders",
  "Manages top-account relationships",
  "Reports to ownership weekly",
];

const HUSTLE_BULLETS = [
  "Hunts local medical, construction, sports leads",
  "Builds group room blocks for community events",
  "Pitches meeting + catering opportunities",
  "Mines repeat stay opportunities",
  "Wins back lapsed local accounts",
];

export function HowItWorks() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <p className="eyebrow">The MHSP Method</p>
        <h2 className="font-display text-4xl text-mhsp-navy mt-3">
          How my Sales TEAM AI works
        </h2>
        <p className="text-mhsp-muted mt-3 max-w-2xl mx-auto">
          Donna&apos;s &ldquo;Synergistic Selling&rdquo; framework runs two funnels at
          once — and our agents work both in parallel, every day.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculated Funnel */}
        <div className="relative bg-white rounded-2xl border border-mhsp-line overflow-hidden shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-mhsp-navy" />
          <div className="p-7">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-mhsp-gold">
                Calculated
              </p>
            </div>
            <h3 className="font-display text-2xl text-mhsp-navy mt-2">
              The Calculated Funnel
            </h3>
            <p className="text-sm font-medium text-mhsp-navy/70 mt-1">
              Brand-level. Big revenue. Top accounts.
            </p>
            <ul className="mt-5 space-y-2.5">
              {CALCULATED_BULLETS.map((b) => (
                <li key={b} className="flex gap-2.5 text-[15px] text-mhsp-text leading-relaxed">
                  <span className="text-mhsp-navy mt-1">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-mhsp-line">
              <p className="font-numeric text-mhsp-navy font-bold">
                <span className="text-3xl">6</span>{" "}
                <span className="text-sm font-semibold uppercase tracking-wider text-mhsp-muted">
                  calculated agents working in parallel
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Hustle Funnel */}
        <div className="relative bg-white rounded-2xl border border-mhsp-line overflow-hidden shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-mhsp-teal" />
          <div className="p-7">
            <div className="flex items-center gap-2">
              <span className="text-3xl">⚡</span>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-mhsp-gold">
                Hustle
              </p>
            </div>
            <h3 className="font-display text-2xl text-mhsp-teal mt-2">
              The Hustle Funnel
            </h3>
            <p className="text-sm font-medium text-mhsp-teal/80 mt-1">
              Local. Grassroots. Backyard.
            </p>
            <ul className="mt-5 space-y-2.5">
              {HUSTLE_BULLETS.map((b) => (
                <li key={b} className="flex gap-2.5 text-[15px] text-mhsp-text leading-relaxed">
                  <span className="text-mhsp-teal mt-1">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-mhsp-line">
              <p className="font-numeric text-mhsp-teal font-bold">
                <span className="text-3xl">5</span>{" "}
                <span className="text-sm font-semibold uppercase tracking-wider text-mhsp-muted">
                  hustle agents working in parallel
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center mt-10 font-display text-xl text-mhsp-navy max-w-3xl mx-auto leading-snug">
        Together, that&apos;s{" "}
        <span className="italic text-mhsp-gold">Synergistic Selling</span> — the MHSP
        method, on autopilot, every day.
      </p>
    </section>
  );
}
