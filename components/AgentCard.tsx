"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Crosshair,
  Zap,
} from "lucide-react";
import type { Agent } from "@/lib/agents";
import { iconForAgent } from "@/lib/agent-icons";

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
  const Icon = iconForAgent(agent.id);
  const tags = SPECIALTIES[agent.id] ?? [];
  const isLive = agent.tier === 1;
  const isCalculated = agent.funnel === "calculated";
  const cleanName = agent.name.replace(/\s+Agent$/i, "");

  const iconTile = isCalculated
    ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
    : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";

  const stripGradient = isCalculated
    ? "from-[#0F4C81] via-[#1B6EB7] to-[#0F4C81]"
    : "from-[#2F8FCC] via-[#1B6EB7] to-[#2F8FCC]";

  const FunnelIcon = isCalculated ? Crosshair : Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6EB7] focus-visible:ring-offset-2 rounded-2xl"
      >
        <article className="relative h-full bg-white rounded-2xl border border-[#E5ECF4] overflow-hidden shadow-[0_8px_28px_-14px_rgba(15,76,129,0.14),0_2px_8px_-4px_rgba(15,76,129,0.06)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(15,76,129,0.25),0_8px_18px_-8px_rgba(15,76,129,0.12)] hover:border-[#1B6EB7]/30 transition-all duration-300">
          {/* Top accent strip */}
          <div
            className={`h-1 w-full bg-gradient-to-r ${stripGradient}`}
          />

          {/* Decorative corner glow */}
          <span
            className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-[0.07] pointer-events-none"
            style={{
              background: isCalculated
                ? "radial-gradient(closest-side, #0F4C81, transparent)"
                : "radial-gradient(closest-side, #2F8FCC, transparent)",
            }}
          />

          <div className="relative p-5 sm:p-6">
            {/* Header — icon tile + status pill */}
            <div className="flex items-start justify-between gap-3">
              <div
                className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-[0_6px_18px_-8px_rgba(15,76,129,0.5)] ${iconTile}`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} />
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold uppercase tracking-wider border ${
                  isLive
                    ? "bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30"
                    : "bg-mhsp-gold/10 text-mhsp-gold border-mhsp-gold/30"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLive ? "bg-mhsp-success animate-pulse" : "bg-mhsp-gold"
                  }`}
                />
                {isLive ? "Live" : "Ready"}
              </span>
            </div>

            {/* Role title eyebrow */}
            <p className="mt-5 text-sm font-bold tracking-[0.16em] uppercase text-mhsp-gold">
              {agent.roleTitle}
            </p>

            {/* Name */}
            <h3 className="font-heading mt-1.5 text-[22px] font-bold leading-tight text-mhsp-navy">
              {cleanName}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-mhsp-muted leading-relaxed line-clamp-2">
              {agent.description}
            </p>

            {/* Specialty chips */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-sm font-semibold rounded-full bg-[#F4F8FC] border border-[#DCE5EF] text-mhsp-navy/80 px-2.5 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Footer — funnel + arrow */}
            <div className="mt-5 pt-5 border-t border-[#E5ECF4] flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-[0.14em] uppercase ${
                  isCalculated ? "text-mhsp-navy" : "text-mhsp-teal"
                }`}
              >
                <FunnelIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                {isCalculated ? "Calculated" : "Hustle"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EDF4FB] group-hover:bg-[#1B6EB7] border border-[#C9DAEB] group-hover:border-[#1B6EB7] text-[#1B6EB7] group-hover:text-white px-3 py-1.5 text-sm font-bold uppercase tracking-[0.12em] transition-all duration-200">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
