"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Agent } from "@/lib/agents";

const GRADIENT: Record<string, string> = {
  teal: "from-mhsp-teal to-mhsp-navy",
  green: "from-emerald-500 to-mhsp-teal",
  blue: "from-mhsp-teal to-mhsp-navy-soft",
  purple: "from-purple-500 to-mhsp-navy",
  orange: "from-orange-500 to-mhsp-gold",
  amber: "from-amber-400 to-mhsp-gold",
  indigo: "from-indigo-500 to-mhsp-navy",
  pink: "from-pink-400 to-purple-500",
  red: "from-rose-500 to-mhsp-navy",
  emerald: "from-emerald-500 to-mhsp-teal",
  violet: "from-violet-500 to-mhsp-navy",
};

const SPECIALTIES: Record<string, string[]> = {
  "00_director_of_sales": ["Strategy", "Reporting", "Coordination"],
  "01_lead_generation": ["Backyard", "Prospecting", "Lists"],
  "02_outbound_sales": ["Cold Email", "Scripts", "LinkedIn"],
  "03_account_manager": ["Top Accounts", "Retention", "QBRs"],
  "04_rfp_closing": ["RFPs", "Pricing", "Big Revenue"],
  "05_lnr_closing": ["LNR", "Tiered Rates", "Corporate"],
  "06_group_sales": ["Group Blocks", "Inquiries", "Contracts"],
  "07_meeting_catering": ["Meetings", "Catering", "Quotes"],
  "08_after_sales": ["Follow-up", "Reviews", "Repeat"],
  "09_retention": ["Win-back", "Loyalty", "Backyard"],
  "10_revenue_leadership": ["Dashboards", "KPIs", "Reports"],
};

export function AgentCard({
  agent,
  profile,
  index = 0,
}: {
  agent: Agent;
  profile: string;
  index?: number;
}) {
  const href = `/agent/${agent.id}?profile=${encodeURIComponent(profile)}`;
  const gradient = GRADIENT[agent.color] ?? GRADIENT.teal;
  const tags = SPECIALTIES[agent.id] ?? [];
  const isLive = agent.tier === 1;
  const isCalculated = agent.funnel === "calculated";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link href={href} className="group block h-full">
        <article className="h-full bg-white rounded-2xl border border-mhsp-line overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(15,76,129,0.22)] hover:border-mhsp-gold/60">
          <div
            className={`relative bg-gradient-to-br ${gradient} aspect-[16/9] flex items-center justify-center`}
          >
            <span className="text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
              {agent.icon}
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.20),transparent_60%)]" />

            {/* Funnel badge — top left */}
            <span
              className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase ${
                isCalculated
                  ? "bg-mhsp-navy text-white"
                  : "bg-mhsp-teal text-white"
              }`}
            >
              {isCalculated ? "🎯 Calculated" : "⚡ Hustle"}
            </span>

            {/* Live/Ready — top right */}
            <span
              className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[14px] font-bold tracking-wider uppercase ${
                isLive
                  ? "bg-mhsp-success text-white"
                  : "bg-mhsp-gold text-white"
              }`}
            >
              <span className="h-1 w-1 rounded-full bg-current" />
              {isLive ? "LIVE" : "READY"}
            </span>
          </div>
          <div className="p-5">
            <p className="text-[14px] font-semibold tracking-[0.18em] text-mhsp-gold uppercase">
              {agent.roleTitle}
            </p>
            <h3 className="font-display text-xl text-mhsp-navy mt-1.5 leading-tight">
              {agent.name}
            </h3>
            <p className="text-sm text-mhsp-muted mt-2 leading-relaxed line-clamp-2">
              {agent.description}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-mhsp-line/60">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-[14px] font-medium uppercase tracking-wider text-mhsp-navy/70 bg-mhsp-cream-warm rounded-full px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
