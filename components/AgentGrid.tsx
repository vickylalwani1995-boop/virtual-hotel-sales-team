import { AGENTS, type Agent } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";

export function AgentGrid({ profile }: { profile: string }) {
  const tier1 = AGENTS.filter((a) => a.tier === 1);
  const tier2 = AGENTS.filter((a) => a.tier === 2);

  return (
    <div className="space-y-12">
      <Section
        eyebrow="Active Now"
        title="Live agents"
        description="These agents call the Claude API and produce real outputs against your hotel profile."
        items={tier1}
        profile={profile}
        offset={0}
      />
      <Section
        eyebrow="On Standby"
        title="Sample-ready specialists"
        description="Pre-rendered demo outputs ready to load instantly — perfect for client walkthroughs."
        items={tier2}
        profile={profile}
        offset={tier1.length}
      />
    </div>
  );
}

function Section({
  eyebrow,
  title,
  description,
  items,
  profile,
  offset,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: readonly Agent[];
  profile: string;
  offset: number;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="font-display text-2xl text-mhsp-navy mt-1">{title}</h2>
        </div>
        <p className="text-sm text-mhsp-muted max-w-md">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((a, i) => (
          <AgentCard key={a.id} agent={a} profile={profile} index={offset + i} />
        ))}
      </div>
    </section>
  );
}
