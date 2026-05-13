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
import { getWelcomeAgent } from "@/lib/welcome-team";

const SPECIALTIES: Record<string, string[]> = {
  "01_director": ["Strategy", "Planning", "Coordination"],
  "02_lead_gen": ["Prospecting", "Local Market", "Lead Scoring"],
  "03_outbound": ["Cold Email", "Scripts", "LinkedIn"],
  "04_rfp_group": ["RFPs", "Group Blocks", "LNR Rates"],
  "05_retention": ["Follow-up", "Win-back", "Reviews"],
  "06_revenue": ["Dashboards", "KPIs", "Reports"],
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
  const welcome = getWelcomeAgent(agent);
  const isCalculated = agent.funnel === "calculated";
  const cleanName = welcome.realName;

  const iconTile = isCalculated
    ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
    : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";

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
        <article className="relative h-full bg-white rounded-2xl border border-[#E5ECF4] overflow-hidden hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(15,76,129,0.22)] hover:border-[#1B6EB7]/30 transition-all duration-300">

          {/* Header with photo + icon */}
          <div className="relative px-5 pt-5 pb-4 flex items-start gap-3.5">
            {/* Photo circle */}
            {welcome.photo && (
              <div className="shrink-0 h-14 w-14 rounded-full overflow-hidden ring-2 ring-[#E5ECF4] group-hover:ring-[#1B6EB7]/25 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={welcome.photo}
                  alt={welcome.realName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {!welcome.photo && (
              <div
                className={`shrink-0 h-14 w-14 rounded-full flex items-center justify-center text-white ${iconTile}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {/* Name */}
              <h3 className="font-heading text-[18px] font-bold leading-tight text-mhsp-navy truncate">
                {cleanName}
              </h3>
              {/* Job title */}
              <p className="text-[13px] font-semibold text-[#1B6EB7] mt-0.5 truncate">
                {welcome.designation}
              </p>
            </div>

            {/* Captain badge or status dot */}
            {agent.isCaptain ? (
              <span className="shrink-0 mt-1 text-[9px] font-bold tracking-[0.16em] uppercase bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full">
                Captain
              </span>
            ) : (
              <span
                className="shrink-0 mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_0_3px_rgba(52,211,153,0.2)]"
                title="Online"
              />
            )}
          </div>

          {/* Description */}
          <div className="px-5 pt-2.5 pb-4">
            <p className="text-sm text-mhsp-muted leading-relaxed line-clamp-2">
              {agent.description}
            </p>
          </div>

          {/* Specialty chips */}
          {tags.length > 0 && (
            <div className="px-5 pb-4 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-semibold rounded-full bg-[#F4F8FC] border border-[#E5ECF4] text-mhsp-navy/70 px-2.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Footer — funnel + arrow */}
          <div className="px-5 py-3.5 border-t border-[#F0F4F8] bg-[#FAFCFE] flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase ${
                isCalculated ? "text-mhsp-navy/55" : "text-[#2F8FCC]/80"
              }`}
            >
              <FunnelIcon className="h-3 w-3" strokeWidth={2.5} />
              {isCalculated ? "Calculated" : "Hustle"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EDF4FB] group-hover:bg-[#1B6EB7] border border-[#DCE5EF] group-hover:border-[#1B6EB7] text-[#1B6EB7] group-hover:text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200">
              Chat
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
