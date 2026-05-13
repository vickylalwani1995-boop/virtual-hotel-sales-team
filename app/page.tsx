"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Clock,
  Hotel,
  Lock,
  MapPin,
  MoreVertical,
  Paperclip,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustBar } from "@/components/TrustBar";
import { AGENTS, type Agent } from "@/lib/agents";
import { iconForAgent } from "@/lib/agent-icons";

/* --- Constants --- */

const HOTEL_HISTORY_KEY = "vhst-hotel-history";
const HOTEL_PROFILE_KEY = "vhst-hotel-profile";

const DEFAULT_PROFILE = `Hotel Name: The Westmore Hotel Dallas
Location: Downtown Dallas, Texas, USA
Rooms: 220
Target Business: Corporate, Group Meetings, Medical, Long-Stay Project Teams
Slow Days: Sunday to Tuesday
Main Need: More weekday corporate occupancy + group business
Meeting Space: Yes - 4 banquet halls, max 600 pax
Catering: Yes - in-house + outdoor catering
Brand: Independent boutique
Average Daily Rate: $189
Current Occupancy: 62%`;

const FIELD_HINTS = [
  "Hotel Name",
  "Location",
  "Rooms",
  "Target Business",
  "Slow Days",
  "Main Need",
  "ADR",
  "Occupancy",
];

/* --- Hotel History Types --- */

interface HotelHistoryEntry {
  id: string;
  name: string;
  location: string;
  rooms: number;
  profile: string;
  briefedAt: string;
  agentsOnline: number;
  leadsCount: number;
  emailsDrafted: number;
}

function extractField(profile: string, field: string): string {
  const re = new RegExp(`${field}\\s*:\\s*([^\\n]+)`, "i");
  const m = profile.match(re);
  return m ? m[1].trim() : "";
}

function extractRooms(profile: string): number {
  const val = extractField(profile, "Rooms");
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

function getHotelHistory(): HotelHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HOTEL_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  const profile = window.localStorage.getItem(HOTEL_PROFILE_KEY);
  if (profile && profile.trim().length > 10) {
    const entry: HotelHistoryEntry = {
      id: crypto.randomUUID(),
      name: extractField(profile, "Hotel Name") || "Your Hotel",
      location: extractField(profile, "Location") || "",
      rooms: extractRooms(profile),
      profile,
      briefedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      agentsOnline: 6,
      leadsCount: 25,
      emailsDrafted: 5,
    };
    window.localStorage.setItem(HOTEL_HISTORY_KEY, JSON.stringify([entry]));
    return [entry];
  }
  return [];
}

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return "yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
}

/* --- Page --- */

export default function Home() {
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelHistoryEntry[]>([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHotels(getHotelHistory());
    setMounted(true);
  }, []);

  const charCount = profile.length;
  const lineCount = profile.split("\n").length;

  function handleSubmit() {
    const value = profile.trim();
    if (!value) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HOTEL_PROFILE_KEY, value);
    }
    router.push(`/agents?profile=${encodeURIComponent(value)}`);
  }

  function scrollToBrief() {
    document.getElementById("brief-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* SECTION 1 - HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 600px at 50% 0%, rgba(47,143,204,0.07), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F4F6FA 100%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="max-w-[800px] mx-auto px-5 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1B6EB7]/20 bg-[#EAF0F9] px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1B6EB7]">
            <Sparkles className="h-3 w-3" />
            My Sales TEAM AI
          </span>

          <h1 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[48px] font-bold leading-[1.05] tracking-tight text-[#0F4C81]">
            Your virtual sales department.
            <br />
            <span className="text-[#1B6EB7]">Ready in 60 seconds.</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#6B7B8F] leading-relaxed max-w-[600px] mx-auto">
            6 AI specialists working your calculated funnel AND your backyard
            market &mdash; every single day. Trained on the MHSP method.
          </p>
        </motion.div>
      </section>

      {/* SECTION 2 - YOUR HOTELS */}
      <section className="bg-[#F4F6FA]">
        <div className="max-w-[900px] mx-auto px-5 sm:px-6 py-12 sm:py-14">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-4 w-4 text-[#1B6EB7]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#1B6EB7]">
              Your Hotels ({mounted ? hotels.length : 0})
            </span>
          </div>

          {mounted && hotels.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-12 text-center">
              <Hotel className="h-20 w-20 mx-auto text-[#1B6EB7]/20" strokeWidth={1.5} />
              <h3 className="font-heading text-xl font-bold text-[#0F4C81] mt-4">
                No hotels yet
              </h3>
              <p className="text-sm text-[#6B7B8F] mt-2">
                Start by briefing your first hotel below &darr;
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hotels.slice(0, 5).map((hotel, i) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.1 }}
                >
                  <HotelCard hotel={hotel} />
                </motion.div>
              ))}
              {hotels.length > 5 && (
                <p className="text-sm font-semibold text-[#1B6EB7] text-center pt-2 cursor-pointer hover:underline">
                  View all hotels &rarr;
                </p>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={scrollToBrief}
              className="inline-flex items-center gap-2 rounded-xl border border-[#1B6EB7]/30 bg-white hover:bg-[#F4F8FC] text-[#1B6EB7] px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Brief a new hotel
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3 - BRIEF A NEW HOTEL */}
      <section id="brief-section" className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-14 items-start">
            {/* LEFT — copy & info */}
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[#1B6EB7]" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#1B6EB7]">
                  Brief a New Hotel
                </span>
              </div>

              <h2 className="font-heading text-[28px] sm:text-[34px] font-bold leading-[1.1] tracking-tight text-[#0F4C81]">
                Tell us about your hotel.
              </h2>
              <p className="mt-3 text-base text-[#6B7B8F] leading-relaxed">
                Paste a quick brief. Your sales team will be ready in 60 seconds.
              </p>

              {/* Trust chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                <TrustChip icon={<Zap className="h-3.5 w-3.5" />} label="60-second setup" />
                <TrustChip icon={<Lock className="h-3.5 w-3.5" />} label="Your data stays private" />
                <TrustChip icon={<ShieldCheck className="h-3.5 w-3.5" />} label="No credit card" />
                <TrustChip icon={<Clock className="h-3.5 w-3.5" />} label="Cancel anytime" />
              </div>

              {/* Field hints */}
              <div className="mt-6">
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#6B7B8F] mb-2">
                  Include these fields
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FIELD_HINTS.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F4F6FA] px-2.5 py-1 text-xs font-medium text-[#0F4C81]/80"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upload zone */}
              <div className="mt-6 rounded-xl border border-dashed border-[#C7D9EC] bg-[#F4F6FA] p-5">
                <div className="flex items-center gap-2 text-[#1B6EB7] mb-1">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm font-semibold">Or upload your hotel info</span>
                </div>
                <p className="text-xs text-[#6B7B8F] leading-relaxed">
                  Drop a fact sheet, rate card, STR report, or contract &mdash;
                  we&apos;ll extract the details.
                </p>
                <p className="text-[10px] text-[#6B7B8F]/70 mt-1">
                  PDF, DOCX, XLSX, TXT (max 5 MB)
                </p>
              </div>
            </div>

            {/* RIGHT — form card */}
            <div className="relative rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_8px_30px_-12px_rgba(15,76,129,0.12)] overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />

              <div className="p-5 sm:p-7">
                <div className="relative">
                  <textarea
                    data-chat-input
                    data-tour="hotel-input"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    placeholder={"Hotel Name: ...\nLocation: ...\nRooms: ...\nTarget Business: ...\nSlow Days: ...\nMain Need: ..."}
                    className="w-full min-h-[340px] sm:min-h-[380px] resize-none font-mono text-sm leading-relaxed bg-[#FAFCFE] border-[1.5px] border-[#DCE5EF] rounded-xl px-4 py-3.5 pb-9 text-[#0F2547] placeholder:text-[#6B7B8F]/50 focus:outline-none focus:border-[#1B6EB7] focus:shadow-[0_0_0_3px_rgba(27,110,183,0.12)] focus:bg-white transition-all hover:border-[#B0C8E0]"
                  />
                  <span className="absolute bottom-2.5 right-3 text-xs text-[#6B7B8F]/60 font-mono pointer-events-none select-none bg-gradient-to-l from-[#FAFCFE] via-[#FAFCFE] to-transparent pl-6">
                    {lineCount} {lineCount === 1 ? "line" : "lines"} &middot; {charCount} chars
                  </span>
                </div>
              </div>

              <div className="px-5 sm:px-7 pb-6 pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProfile(DEFAULT_PROFILE)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7B8F] hover:text-[#0F4C81] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to sample
                </button>
                <div className="flex-1" />
                <button
                  data-tour="generate-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={!profile.trim()}
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#0F4C81] hover:bg-[#0D3D68] disabled:opacity-40 disabled:cursor-not-allowed px-6 sm:px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_-10px_rgba(15,76,129,0.55)] hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.65)] hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Sales Team
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - THE MHSP METHOD */}
      <HowItWorks />

      {/* SECTION 5 - YOUR AI WORKFORCE (LOCKED PREVIEW) */}
      <section className="bg-[#F4F6FA]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1B6EB7] shadow-sm">
              <User className="h-3.5 w-3.5" />
              Your AI Workforce
            </span>
            <h2 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[48px] font-bold leading-[1.05] tracking-tight text-[#0F4C81]">
              6 specialists. Trained on the MHSP method.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6B7B8F] leading-relaxed">
              Ready to assemble the moment you brief your hotel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {AGENTS.map((agent) => (
              <LockedAgentCard key={agent.id} agent={agent} onUnlock={scrollToBrief} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - TRUST STRIP */}
      <TrustBar />
    </>
  );
}

/* --- Sub-components --- */

function HotelCard({ hotel }: { hotel: HotelHistoryEntry }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(15,76,129,0.15)] transition-all">
      <div className="flex items-start gap-4">
        <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] flex items-center justify-center text-white shadow-md">
          <Building2 className="h-6 w-6" strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#0F4C81] leading-tight truncate">
            {hotel.name}
          </h3>
          {(hotel.location || hotel.rooms > 0) && (
            <p className="text-sm text-[#6B7B8F] mt-0.5 flex items-center gap-1.5 flex-wrap">
              {hotel.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {hotel.location}
                </span>
              )}
              {hotel.location && hotel.rooms > 0 && <span>&middot;</span>}
              {hotel.rooms > 0 && <span>{hotel.rooms} rooms</span>}
            </p>
          )}
          <p className="text-xs text-[#6B7B8F]/80 mt-1.5 flex items-center gap-1 flex-wrap">
            <Clock className="h-3 w-3 shrink-0" />
            Last brief: {relativeTime(hotel.briefedAt)}
            {hotel.agentsOnline > 0 && <>&nbsp;&middot; {hotel.agentsOnline} agents online</>}
            {hotel.leadsCount > 0 && <>&nbsp;&middot; {hotel.leadsCount} leads</>}
            {hotel.emailsDrafted > 0 && <>&nbsp;&middot; {hotel.emailsDrafted} emails drafted</>}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Link
            href={`/agents?profile=${encodeURIComponent(hotel.profile)}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-4 py-2 text-sm font-semibold transition-colors"
          >
            Open Workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            className="text-sm font-semibold text-[#1B6EB7] hover:text-[#0F4C81] transition-colors hidden sm:block"
          >
            Re-brief
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-8 w-8 rounded-lg hover:bg-[#F4F6FA] flex items-center justify-center text-[#6B7B8F] transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[#E2E8F0] bg-white shadow-lg z-20 py-1">
                <button className="w-full text-left px-3 py-2 text-sm text-[#0F2547] hover:bg-[#F4F6FA]">Edit</button>
                <button className="w-full text-left px-3 py-2 text-sm text-[#0F2547] hover:bg-[#F4F6FA]">Archive</button>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedAgentCard({
  agent,
  onUnlock,
}: {
  agent: Agent;
  onUnlock: () => void;
}) {
  const Icon = iconForAgent(agent.id);
  const isCalculated = agent.funnel === "calculated";
  const cleanName = agent.realName;

  return (
    <button
      onClick={onUnlock}
      className="group relative text-left bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:border-[#C7D9EC] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(15,76,129,0.12)] transition-all overflow-hidden cursor-pointer"
      title="Generate team to unlock"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-12 w-12 rounded-xl bg-[#E2E8F0] flex items-center justify-center text-[#6B7B8F]/50 opacity-50">
          <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wider uppercase bg-[#F4F6FA] text-[#6B7B8F] border border-[#E2E8F0]">
          <Lock className="h-3 w-3 animate-pulse" />
          Locked
        </span>
      </div>

      <p className="mt-5 text-xs font-bold tracking-[0.16em] uppercase text-[#6B7B8F]/60">
        {agent.designation}
      </p>

      <h3 className="font-heading mt-1.5 text-[22px] font-bold leading-tight text-[#6B7B8F]/50">
        {cleanName}
      </h3>

      <p className="mt-2 text-sm text-[#6B7B8F]/40 leading-relaxed line-clamp-3">
        {agent.description}
      </p>

      <div className="mt-5 pt-5 border-t border-[#E2E8F0] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#6B7B8F]/50 tracking-wide uppercase">
          {isCalculated ? "Calculated" : "Hustle"}
        </span>
        <span className="text-xs font-semibold text-[#1B6EB7] opacity-0 group-hover:opacity-100 transition-opacity">
          Generate team to unlock &rarr;
        </span>
      </div>
    </button>
  );
}

function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F4C81] shadow-sm">
      <span className="text-[#1B6EB7]">{icon}</span>
      {label}
    </span>
  );
}
