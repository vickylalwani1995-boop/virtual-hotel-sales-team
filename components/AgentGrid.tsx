import { AGENTS, FUNNELS, type Agent, type Funnel } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";
import { Crosshair, Zap } from "lucide-react";

const FUNNEL_ORDER: { key: Funnel; ids: string[] }[] = [
  {
    key: "calculated",
    ids: [
      "01_director",
      "03_outbound",
      "04_rfp_group",
      "06_revenue",
    ],
  },
  {
    key: "hustle",
    ids: [
      "02_lead_gen",
      "05_retention",
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
      {/* Funnel banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E5ECF4] mb-6">
        <div className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6">
          <div
            className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md ${iconTile}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-mhsp-navy leading-tight">
                {label} Funnel
              </h2>
              <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-[0.08em] uppercase whitespace-nowrap ${
                isCalculated
                  ? "border-[#C9DAEB] bg-[#EDF4FB] text-mhsp-navy"
                  : "border-[#B3D9F0] bg-[#E8F5FC] text-mhsp-teal"
              }`}>
                {isCalculated ? "Big Revenue" : "Backyard Revenue"}
              </span>
            </div>
            <p className="mt-1 text-sm text-mhsp-muted leading-relaxed line-clamp-1">
              {description}
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex items-baseline gap-1.5 rounded-full bg-[#F4F8FC] border border-[#E5ECF4] px-4 py-2">
            <span className="font-numeric text-2xl font-bold text-mhsp-navy leading-none">
              {items.length}
            </span>
            <span className="text-sm text-mhsp-muted font-medium">
              agents
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
