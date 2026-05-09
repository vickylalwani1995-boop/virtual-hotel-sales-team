import { AGENTS, FUNNELS, type Agent, type Funnel } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";

const FUNNEL_ORDER: { key: Funnel; ids: string[] }[] = [
  {
    key: "calculated",
    ids: [
      "00_director_of_sales",
      "02_outbound_sales",
      "04_rfp_closing",
      "05_lnr_closing",
      "03_account_manager",
      "10_revenue_leadership",
    ],
  },
  {
    key: "hustle",
    ids: [
      "01_lead_generation",
      "06_group_sales",
      "07_meeting_catering",
      "08_after_sales",
      "09_retention",
    ],
  },
];

export function AgentGrid({ profile }: { profile: string }) {
  let cardIndex = 0;
  return (
    <div className="space-y-12">
      {FUNNEL_ORDER.map(({ key, ids }) => {
        const meta = FUNNELS[key];
        const items = ids
          .map((id) => AGENTS.find((a) => a.id === id))
          .filter((a): a is Agent => Boolean(a));
        const offset = cardIndex;
        cardIndex += items.length;
        return (
          <FunnelSection
            key={key}
            funnel={key}
            label={meta.label}
            tagline={meta.tagline}
            description={meta.description}
            emoji={meta.emoji}
            items={items}
            profile={profile}
            offset={offset}
          />
        );
      })}
    </div>
  );
}

function FunnelSection({
  funnel,
  label,
  tagline,
  description,
  emoji,
  items,
  profile,
  offset,
}: {
  funnel: Funnel;
  label: string;
  tagline: string;
  description: string;
  emoji: string;
  items: readonly Agent[];
  profile: string;
  offset: number;
}) {
  const isCalculated = funnel === "calculated";
  const accentText = isCalculated ? "text-mhsp-navy" : "text-mhsp-teal";
  const accentBg = isCalculated
    ? "from-mhsp-navy/10 to-mhsp-gold/5"
    : "from-mhsp-teal/12 to-mhsp-gold/5";
  const stripe = isCalculated ? "bg-mhsp-navy" : "bg-mhsp-teal";

  return (
    <section>
      {/* Funnel banner */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${accentBg} border border-mhsp-line p-6 mb-5`}
      >
        <span
          className={`absolute left-0 top-0 bottom-0 w-1 ${stripe}`}
        />
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="pl-3">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-mhsp-gold">
              {emoji} {tagline}
            </p>
            <h2 className={`font-display text-2xl mt-1 ${accentText}`}>
              {label}
            </h2>
            <p className="text-sm text-mhsp-muted mt-1.5 max-w-xl leading-relaxed">
              {description}
            </p>
          </div>
          <div
            className={`inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-full bg-white border border-mhsp-line text-xs ${accentText}`}
          >
            <span className="font-numeric text-base font-bold">{items.length}</span>
            <span className="text-mhsp-muted font-medium">agents</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((a, i) => (
          <AgentCard key={a.id} agent={a} profile={profile} index={offset + i} />
        ))}
      </div>
    </section>
  );
}
