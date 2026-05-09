"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  Search,
  Send,
  Handshake,
  FileText,
  Briefcase,
  Users,
  Utensils,
  HeartHandshake,
  RefreshCw,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { consumeWelcomeFlag, getUser, isLoggedIn } from "@/lib/auth";
import { AGENTS } from "@/lib/agents";
import { MhspLogo } from "@/components/MhspLogo";

type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;

const AGENT_ICONS: Record<string, IconType> = {
  "00_director_of_sales": Target,
  "01_lead_generation": Search,
  "02_outbound_sales": Send,
  "03_account_manager": Handshake,
  "04_rfp_closing": FileText,
  "05_lnr_closing": Briefcase,
  "06_group_sales": Users,
  "07_meeting_catering": Utensils,
  "08_after_sales": HeartHandshake,
  "09_retention": RefreshCw,
  "10_revenue_leadership": BarChart3,
};

function cleanAgentName(name: string): string {
  return name.replace(/\s+Agent$/i, "");
}

function prettyName(username: string): string {
  if (!username) return "";
  return username
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function WelcomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");
  // One-shot guard so React StrictMode's double-invocation in dev doesn't
  // run consumeWelcomeFlag twice (which would consume on call #1 and then
  // redirect on call #2 because the flag is already gone).
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    // Only show this page if it was reached via a fresh sign-in.
    // If the flag isn't set (e.g. user typed /welcome directly), bounce home.
    if (!consumeWelcomeFlag()) {
      router.replace("/");
      return;
    }
    const u = getUser();
    setUsername(u?.username ?? "");
    setReady(true);
  }, [router]);

  function enterWorkspace() {
    router.push("/");
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFCFE]">
        <div className="h-8 w-8 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen relative"
      style={{
        background:
          "radial-gradient(700px 480px at 12% 10%, rgba(47,143,204,0.10), transparent 60%), radial-gradient(640px 480px at 92% 92%, rgba(15,76,129,0.08), transparent 65%), linear-gradient(180deg, #FBFCFE 0%, #F1F5FA 100%)",
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative w-full max-w-[1100px] bg-white rounded-[20px] sm:rounded-[28px] border border-[#E5ECF4] shadow-[0_30px_80px_-30px_rgba(15,76,129,0.18),0_8px_24px_-8px_rgba(15,76,129,0.08)] overflow-hidden"
        >
          {/* Top accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />

          <div className="px-5 sm:px-10 lg:px-14 pt-8 sm:pt-12 pb-8 sm:pb-12">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex justify-center"
            >
              <MhspLogo height={44} />
            </motion.div>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-7 flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-[#F4F8FC] px-3 py-1 text-sm font-semibold tracking-[0.18em] uppercase text-[#0F4C81]">
                <Sparkles className="h-3.5 w-3.5 text-[#1B6EB7]" />
                my Sales TEAM AI
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 font-heading text-center text-[#0F1B2D] text-[32px] sm:text-[44px] lg:text-[54px] leading-[1.05] font-bold tracking-tight"
            >
              Welcome
              {username ? (
                <>
                  {", "}
                  <span className="text-[#1B6EB7]">
                    {prettyName(username)}
                  </span>
                </>
              ) : null}
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-4 text-center text-[#5A6B82] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            >
              Your virtual sales department is online. Eleven specialist
              agents, ready to take their first brief.
            </motion.p>

            {/* Agent grid - full name + description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {AGENTS.map((a, i) => {
                const Icon = AGENT_ICONS[a.id] ?? Target;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.6 + i * 0.04,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                    className="group flex items-start gap-3 rounded-xl border border-[#E5ECF4] bg-white hover:bg-[#F4F8FC] hover:border-[#C9DAEB] hover:-translate-y-0.5 px-4 py-3.5 transition-all"
                  >
                    <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(27,110,183,0.45)]">
                      <Icon
                        className="h-[18px] w-[18px] text-white"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0F1B2D] leading-tight">
                        {cleanAgentName(a.name)}
                      </p>
                      <p className="mt-1 text-sm text-[#5A6B82] leading-snug">
                        {a.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              className="mt-9 sm:mt-11 flex justify-center"
            >
              <button
                onClick={enterWorkspace}
                autoFocus
                className="group cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.6)] hover:-translate-y-0.5 transition-all"
              >
                Enter Workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Footer credit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.35 }}
              className="mt-10 sm:mt-12 pt-6 border-t border-[#E5ECF4] text-center"
            >
              <p className="text-sm text-[#5A6B82] tracking-[0.18em] uppercase">
                Powered by{" "}
                <span className="font-semibold text-[#0F4C81]">
                  My Hospitality Sales Pro
                </span>{" "}
                &amp;{" "}
                <span className="font-semibold text-[#0F4C81]">
                  Inntelligent CRM
                </span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
