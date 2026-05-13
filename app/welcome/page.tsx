"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Sparkles, Target, Zap, User } from "lucide-react";
import { consumeWelcomeFlag, getUser, isLoggedIn } from "@/lib/auth";
import { AGENTS, type Agent } from "@/lib/agents";
import { MhspLogo } from "@/components/MhspLogo";
import { getWelcomeAgent, saveWelcomeTeam } from "@/lib/welcome-team";

function seqNum(n: number) { return String(n).padStart(2, "0"); }

function isGenericUsername(u: string) {
  if (!u) return true;
  const lower = u.toLowerCase();
  return ["test","demo","admin","user","mhsp_sales","mhsp"].includes(lower)
    || u.includes("_") || /\d/.test(u);
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

interface HotelData { name: string; rooms: string; slowDays: string; }

function readHotelData(): HotelData {
  const DEMO = { name: "The Westmore Hotel Dallas", rooms: "220", slowDays: "Sun–Tue" };
  try {
    const raw = localStorage.getItem("vhst-hotel-profile") ?? "";
    if (!raw || raw.length < 10) return DEMO;
    if (raw.toLowerCase().includes("westmore")) return DEMO;
    const m = raw.match(/(\d{2,4})\s*(?:room|key|suite)/i);
    return { name: "Your Hotel", rooms: m?.[1] ?? "—", slowDays: "—" };
  } catch { return DEMO; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  const router = useRouter();
  const [ready, setReady]       = useState(false);
  const [username, setUsername] = useState("");
  const [hotel, setHotel]       = useState<HotelData | null>(null);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    if (!isLoggedIn())         { router.replace("/login"); return; }
    if (!consumeWelcomeFlag()) { router.replace("/");      return; }
    const u = getUser();
    setUsername(u?.username ?? "");
    setHotel(readHotelData());
    saveWelcomeTeam(AGENTS);
    setReady(true);
  }, [router]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
      <div className="h-8 w-8 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
    </div>
  );

  const captain        = AGENTS.find((a) => a.isCaptain)!;
  const calculatedTeam = AGENTS.filter((a) => a.funnel === "calculated" && !a.isCaptain);
  const hustleTeam     = AGENTS.filter((a) => a.funnel === "hustle");
  // captain=01, calculated 02–06, hustle 07–11
  const hustleStart    = 2 + calculatedTeam.length;

  const heading = isGenericUsername(username)
    ? "Welcome back. Your sales team is ready."
    : `Welcome back, ${capitalize(username)}.`;

  return (
    <main className="min-h-screen bg-[#F4F6FA] pb-10 sm:pb-14">

      {/* ── LOGO ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center pt-5 sm:pt-7"
      >
        <MhspLogo height={42} />
      </motion.div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="text-center px-4 pt-4 pb-8 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1B6EB7]/25 bg-[#E8F0F9] px-4 py-1.5 text-[11px] font-bold tracking-[0.22em] uppercase text-[#0F4C81]">
            <Sparkles className="h-3 w-3 text-[#1B6EB7]" strokeWidth={2.5} />
            My Sales TEAM AI
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.15 }}
          className="mt-5 font-heading font-bold text-[#0F2547] leading-[1.05] tracking-tight
                     text-[28px] sm:text-[40px] md:text-[50px] lg:text-[58px]"
        >
          {heading}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="mt-3 text-[#6B7B8F] text-sm sm:text-base font-medium"
        >
          6 agents online&nbsp;&nbsp;·&nbsp;&nbsp;2 funnels active
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="mt-4 mx-auto max-w-2xl text-sm sm:text-base text-[#5E7086] leading-relaxed"
        >
          Your team is initialized with your hotel context. Open the workspace to route tasks,
          start agent chats, and launch call simulations without re-entering setup data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.32 }}
          className="mt-6"
        >
          <button
            onClick={() => router.push("/")}
            className="group inline-flex items-center gap-2 rounded-xl bg-[#0F4C81]
                       hover:bg-[#0A3660] text-white px-7 sm:px-9 py-3 sm:py-3.5
                       text-sm font-bold uppercase tracking-[0.14em]
                       shadow-[0_10px_24px_-10px_rgba(15,76,129,0.5)]
                       hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.65)]
                       hover:-translate-y-0.5 transition-all"
          >
            Enter Workspace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6"
      >

        {/* Hotel context bar */}
        {hotel && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2
                          rounded-xl bg-[#0F4C81] px-5 sm:px-7 py-3.5 sm:py-4">
            <Building2 className="h-4 w-4 text-white/55 shrink-0" strokeWidth={1.75} />
            <span className="text-white text-[11px] sm:text-[12px] font-bold tracking-[0.18em] uppercase">
              {hotel.name}
            </span>
            <span className="text-white/30 font-bold">·</span>
            <span className="text-white/70 text-[11px] sm:text-[12px] font-semibold tracking-[0.12em] uppercase">
              {hotel.rooms} Rooms
            </span>
            <span className="text-white/30 font-bold">·</span>
            <span className="text-white/70 text-[11px] sm:text-[12px] font-semibold tracking-[0.12em] uppercase">
              Slow {hotel.slowDays}
            </span>
          </div>
        )}

        {/* ── CALCULATED FUNNEL ──────────────────────────────────────── */}
        <FunnelSection
          label="Calculated Funnel — Big Revenue"
          sublabel="The Calculated Funnel"
          SubIcon={Target}
          bg="bg-[#F0F5FB]"
          divider="border-[#C5D8EE]"
        >
          <CaptainCard agent={captain} num={1} />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
            {calculatedTeam.map((a, i) => (
              <AgentCard key={a.id} agent={a} num={i + 2} />
            ))}
          </div>
        </FunnelSection>

        {/* Diamond divider */}
        <div className="flex items-center gap-4 py-1">
          <span className="flex-1 h-px bg-[#1B6EB7]/10" />
          <span className="text-[#1B6EB7]/35 text-lg font-bold leading-none select-none">◆</span>
          <span className="flex-1 h-px bg-[#1B6EB7]/10" />
        </div>

        {/* ── HUSTLE FUNNEL ──────────────────────────────────────────── */}
        <FunnelSection
          label="Hustle Funnel — Backyard Revenue"
          sublabel="The Hustle Funnel"
          SubIcon={Zap}
          bg="bg-[#EAF2FA]"
          divider="border-[#B3D4EE]"
          labelColor="text-[#1B6EB7]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
            {hustleTeam.map((a, i) => (
              <AgentCard key={a.id} agent={a} num={hustleStart + i} />
            ))}
          </div>
        </FunnelSection>

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[12px] text-[#6B7B8F] tracking-[0.12em] uppercase font-semibold">
            Powered by My Hospitality Sales Pro &amp; Inntelligent CRM
          </p>
        </div>
      </motion.div>
    </main>
  );
}

// ─── Funnel Section wrapper ────────────────────────────────────────────────────

function FunnelSection({
  label, sublabel, SubIcon, bg, divider,
  labelColor = "text-[#0F4C81]",
  children,
}: {
  label: string;
  sublabel: string;
  SubIcon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  bg: string;
  divider: string;
  labelColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl ${bg} p-5 sm:p-7 lg:p-8`}>
      <div className={`pb-4 mb-6 border-b ${divider}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className={`text-[10px] font-bold tracking-[0.28em] uppercase ${labelColor}`}>
            {label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C81]/65">
            <SubIcon className="h-3.5 w-3.5" strokeWidth={2} />
            {sublabel}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Captain Card ─────────────────────────────────────────────────────────────

function CaptainCard({ agent, num }: { agent: (typeof AGENTS)[number]; num: number }) {
  const profile = getWelcomeAgent(agent as Agent);
  const photo = profile.photo;

  return (
    <div className="relative rounded-2xl bg-white border-2 border-[#1B6EB7]/30
                    shadow-[0_4px_24px_-6px_rgba(27,110,183,0.10)] overflow-hidden mb-1">

      {/* CAPTAIN badge — always top-right */}
      <span className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10
                       inline-flex items-center rounded-full bg-[#0F4C81]
                       text-white text-[10px] font-bold tracking-[0.18em] uppercase
                       px-3 py-1 leading-none">
        Captain
      </span>

      <div className="p-5 sm:p-7 lg:p-8">
        {/* Agent number */}
        <p className="font-mono text-[11px] font-bold text-[#1B6EB7]/40 mb-4 leading-none">
          {seqNum(num)}
        </p>

        {/* ── MOBILE layout (< md): photo + titles stacked ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="shrink-0 h-16 w-16 rounded-full overflow-hidden ring-2 ring-[#1B6EB7]/12 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C5D8EE] to-[#E2E8F0]">
                <User className="h-8 w-8 text-[#0F4C81]/25" strokeWidth={1.5} />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[#0F2547] text-[22px] sm:text-[26px] leading-tight">
                <span className="inline-block blur-[6px] select-none" aria-hidden="true">{profile.realName}</span>
              </h3>
              <p className="mt-1 text-[15px] sm:text-[17px] font-semibold text-[#1B6EB7] leading-tight">
                {profile.designation}
              </p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#0F4C81]/45 opacity-0">
                {profile.designation}
              </p>
            </div>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6B7B8F] leading-relaxed">
            {agent.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#0F4C81]/55">
            <span>Reports to ownership</span>
            <span className="text-[#1B6EB7]/40 font-bold">·</span>
            <span>Briefs all 10 agents</span>
          </div>
        </div>

        {/* ── DESKTOP layout (md+): name | photo | description ── */}
        <div className="hidden md:flex items-start gap-6 lg:gap-8">
          {/* Name / titles */}
          <div className="shrink-0 w-[200px] lg:w-[240px] xl:w-[260px]">
            <h3 className="font-heading font-bold text-[#0F2547] text-[26px] lg:text-[30px] leading-tight">
              <span className="inline-block blur-[6px] select-none" aria-hidden="true">{profile.realName}</span>
            </h3>
            <p className="mt-1.5 text-[16px] lg:text-[18px] font-semibold text-[#1B6EB7] leading-tight">
              {profile.designation}
            </p>
            <p className="mt-2 text-[10px] font-bold tracking-[0.22em] uppercase text-[#0F4C81]/45 opacity-0">
              {profile.designation}
            </p>
          </div>

          {/* Photo */}
          <div className="shrink-0 h-[84px] w-[84px] lg:h-[96px] lg:w-[96px]
                          rounded-full overflow-hidden ring-2 ring-[#1B6EB7]/15 relative">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C5D8EE] to-[#E2E8F0]">
              <User className="h-10 w-10 text-[#0F4C81]/25" strokeWidth={1.5} />
            </div>
          </div>

          {/* Description + footnote */}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-[#6B7B8F] leading-relaxed">
              {agent.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#0F4C81]/55">
              <span>Reports to ownership</span>
              <span className="text-[#1B6EB7]/40 font-bold">·</span>
              <span>Briefs all 10 agents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, num }: { agent: (typeof AGENTS)[number]; num: number }) {
  const profile = getWelcomeAgent(agent as Agent);
  const photo = profile.photo;

  return (
    <div className="group flex flex-col rounded-xl bg-white
                    border border-[#E2E8F0]
                    hover:border-[#1B6EB7]/35
                    hover:-translate-y-1
                    hover:shadow-[0_10px_32px_-8px_rgba(27,110,183,0.13)]
                    p-5 sm:p-6
                    transition-all duration-200">

      {/* Top row: number + photo */}
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <span className="font-mono text-[11px] font-bold text-[#1B6EB7]/40 leading-none pt-0.5">
          {seqNum(num)}
        </span>
        <div className="shrink-0 h-[52px] w-[52px] sm:h-[58px] sm:w-[58px]
                        rounded-full overflow-hidden
                        ring-2 ring-[#E2E8F0]
                        group-hover:ring-[#1B6EB7]/20
                        transition-all relative">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C5D8EE] to-[#E2E8F0]">
            <User className="h-6 w-6 text-[#0F4C81]/25" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Name */}
      <h3 className="font-heading font-bold text-[#0F2547]
                     text-[18px] sm:text-[19px]
                     leading-tight">
        <span className="inline-block blur-[6px] select-none" aria-hidden="true">{profile.realName}</span>
      </h3>

      {/* Job title */}
      <p className="mt-1 text-[14px] sm:text-[16px] font-semibold text-[#1B6EB7] leading-tight">
        {profile.designation}
      </p>

      {/* MHSP role */}
      <p className="mt-1.5 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#0F4C81]/38 opacity-0">
        {profile.designation}
      </p>

      {/* Divider line */}
      <div className="my-3 sm:my-4 h-px bg-[#E8EFF7]" />

      {/* Description — grows to fill card height */}
      <p className="flex-1 text-[12px] sm:text-[13px] text-[#6B7B8F] leading-[1.62]">
        {agent.description}
      </p>
    </div>
  );
}
