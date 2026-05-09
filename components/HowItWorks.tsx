const CALCULATED_BULLETS = [
  "Identifies enterprise corporate accounts",
  "Responds to RFPs in under 24 hours",
  "Negotiates LNR rates with big spenders",
  "Manages top-account relationships",
  "Reports to ownership weekly",
];

const HUSTLE_BULLETS = [
  "Hunts local medical, construction, sports leads",
  "Builds group room blocks for community events",
  "Pitches meeting + catering opportunities",
  "Mines repeat-stay opportunities",
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
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-mhsp-gold">
              🎯 The Calculated Funnel
            </p>
            <h3 className="font-display text-2xl text-mhsp-navy mt-2 leading-tight">
              Big revenue. Top accounts.
            </h3>
            <p className="text-sm text-mhsp-muted mt-2 leading-relaxed">
              Brand-level precision. Direct relationships with the accounts that
              matter most. Big spends, long contracts, steady revenue.
            </p>
            <ul className="mt-5 space-y-2.5">
              {CALCULATED_BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex gap-2.5 text-[15px] text-mhsp-text leading-relaxed"
                >
                  <span className="text-mhsp-navy mt-1">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-mhsp-line flex items-baseline gap-2">
              <span className="font-numeric text-3xl text-mhsp-navy font-bold">
                6
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-mhsp-muted">
                calculated agents
              </span>
            </div>
          </div>
        </div>

        {/* Hustle Funnel */}
        <div className="relative bg-white rounded-2xl border border-mhsp-line overflow-hidden shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-mhsp-teal" />
          <div className="p-7">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-mhsp-gold">
              ⚡ The Hustle Funnel
            </p>
            <h3 className="font-display text-2xl text-mhsp-teal mt-2 leading-tight">
              Local. Grassroots. Backyard.
            </h3>
            <p className="text-sm text-mhsp-muted mt-2 leading-relaxed">
              First one to convert wins. Medical, sports, construction, weddings,
              repeat stays — all the backyard revenue most hotels miss.
            </p>
            <ul className="mt-5 space-y-2.5">
              {HUSTLE_BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex gap-2.5 text-[15px] text-mhsp-text leading-relaxed"
                >
                  <span className="text-mhsp-teal mt-1">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-mhsp-line flex items-baseline gap-2">
              <span className="font-numeric text-3xl text-mhsp-teal font-bold">
                5
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-mhsp-muted">
                hustle agents
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center mt-12 font-sans font-bold text-[28px] text-mhsp-navy max-w-3xl mx-auto leading-snug">
        Together, that&apos;s{" "}
        <span className="italic text-mhsp-gold">Synergistic Selling</span> — the MHSP
        method, on autopilot, every day.
      </p>
    </section>
  );
}
