import { AGENTS, FUNNELS, type Agent, type Funnel } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";
import { Crosshair, Zap } from "lucide-react";

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
    <div className="space-y-16 sm:space-y-20">
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
  items,
  profile,
  offset,
}: {
  funnel: Funnel;
  label: string;
  tagline: string;
  description: string;
  items: readonly Agent[];
  profile: string;
  offset: number;
}) {
  const isCalculated = funnel === "calculated";
  const Icon = isCalculated ? Crosshair : Zap;

  const iconTile = isCalculated
    ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
    : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";

  const stripGradient = isCalculated
    ? "from-[#0F4C81] via-[#1B6EB7] to-[#0F4C81]"
    : "from-[#2F8FCC] via-[#1B6EB7] to-[#2F8FCC]";

  return (
    <section>
      {/* Funnel banner — premium card style */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_20px_50px_-25px_rgba(15,76,129,0.16),0_4px_14px_-4px_rgba(15,76,129,0.06)] mb-6">
        {/* Top accent strip */}
        <div className={`h-1 w-full bg-gradient-to-r ${stripGradient}`} />

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div
                className={`shrink-0 h-14 w-14 rounded-xl flex items-center justify-center text-white shadow-[0_8px_22px_-8px_rgba(15,76,129,0.55)] ${iconTile}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-[0.18em] uppercase text-mhsp-gold">
                  {tagline}
                </p>
                <h2 className="font-heading text-2xl sm:text-[28px] font-bold text-mhsp-navy mt-1 leading-tight">
                  The {label} Funnel
                </h2>
              </div>
            </div>

            {/* Agent count pill */}
            <div className="shrink-0 inline-flex items-baseline gap-1.5 rounded-full bg-[#F4F8FC] border border-[#DCE5EF] px-4 py-2">
              <span className="font-numeric text-2xl font-bold text-mhsp-navy leading-none">
                {items.length}
              </span>
              <span className="text-sm text-mhsp-muted font-semibold">
                agents
              </span>
            </div>
          </div>

          {/* Description + microcopy */}
          <div className="mt-4 pl-[72px] flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm sm:text-base text-mhsp-muted leading-relaxed flex-1">
              {description}
            </p>
            <span className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold whitespace-nowrap ${
              isCalculated
                ? "border-[#C9DAEB] bg-[#EDF4FB] text-mhsp-navy"
                : "border-[#B3D9F0] bg-[#E8F5FC] text-mhsp-teal"
            }`}>
              {isCalculated
                ? "For high-value accounts"
                : "For backyard revenue"}
            </span>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((a, i) => (
          <AgentCard key={a.id} agent={a} profile={profile} index={offset + i} />
        ))}
      </div>
    </section>
  );
}
