"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RotateCcw,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useDemoMode } from "@/lib/demo-mode";

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

export function HotelInput() {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [demo] = useDemoMode();

  // Listen for the onboarding tour's "I'll enter my own" choice:
  // wipe the default and let the user start fresh.
  useEffect(() => {
    function onClear() {
      setProfile("");
    }
    window.addEventListener("vhst-clear-hotel-profile", onClear);
    return () =>
      window.removeEventListener("vhst-clear-hotel-profile", onClear);
  }, []);

  const charCount = profile.length;
  const lineCount = profile.split("\n").length;

  function handleSubmit() {
    const value = profile.trim();
    if (!value) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("vhst-hotel-profile", value);
    }
    router.push(`/agents?profile=${encodeURIComponent(value)}`);
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-3 sm:-inset-4 rounded-[28px] bg-gradient-to-r from-[#2F8FCC]/20 via-[#1B6EB7]/25 to-[#0F4C81]/20 blur-2xl opacity-70 -z-10" />

      {/* Card */}
      <div className="relative bg-white rounded-2xl sm:rounded-[20px] border border-[#E5ECF4] shadow-[0_24px_60px_-20px_rgba(15,76,129,0.20),0_4px_14px_-4px_rgba(15,76,129,0.06)] overflow-hidden">
        {/* Top accent strip */}
        <div className="h-1 bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-[#EAF2FA]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] flex items-center justify-center text-white shadow-[0_8px_20px_-8px_rgba(15,76,129,0.5)]">
                <Building2 className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-[0.18em] uppercase text-mhsp-gold">
                  Hotel profile
                </p>
                <h3 className="font-heading mt-0.5 text-xl sm:text-[22px] font-bold text-mhsp-navy leading-tight">
                  Paste a quick brief.
                </h3>
                <p className="text-sm text-mhsp-muted mt-1 leading-relaxed">
                  Your AI sales team will be ready in 60 seconds.
                </p>
              </div>
            </div>

            {demo && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-mhsp-success/40 bg-mhsp-success/10 px-2.5 py-1 text-sm font-semibold text-mhsp-success shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
                Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Field hint chips */}
        <div className="px-5 sm:px-8 pt-5 pb-1">
          <p className="text-sm font-semibold tracking-[0.14em] uppercase text-mhsp-muted mb-2.5">
            Include these fields
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FIELD_HINTS.map((h) => (
              <span
                key={h}
                className="inline-flex items-center rounded-full border border-[#E5ECF4] bg-[#F4F8FC] px-2.5 py-1 text-sm font-medium text-mhsp-navy/80"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="px-5 sm:px-8 pt-5 pb-3">
          <div className="relative">
            <textarea
              data-chat-input
              data-tour="hotel-input"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="Hotel Name: ...
Location: ...
Rooms: ...
Target Business: ...
Slow Days: ...
Main Need: ..."
              className="w-full min-h-[260px] sm:min-h-[300px] resize-none font-mono text-sm leading-relaxed bg-[#FAFCFE] border-[1.5px] border-[#DCE5EF] rounded-xl px-4 py-3.5 pb-9 text-mhsp-text placeholder:text-mhsp-muted/60 focus:outline-none focus:border-[#1B6EB7] focus:shadow-[0_0_0_3px_rgba(27,110,183,0.12)] focus:bg-white transition-all hover:border-[#B0C8E0]"
            />
            {/* Counter (bottom-right inside the textarea visual) */}
            <span className="absolute bottom-2.5 right-3 text-sm text-mhsp-muted/65 font-numeric pointer-events-none select-none bg-gradient-to-l from-[#FAFCFE] via-[#FAFCFE] to-transparent pl-6">
              {lineCount} {lineCount === 1 ? "line" : "lines"} · {charCount}{" "}
              chars
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 pb-6 pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setProfile(DEFAULT_PROFILE)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-muted hover:text-mhsp-navy transition-colors"
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
            className="group inline-flex items-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] disabled:opacity-40 disabled:cursor-not-allowed px-6 sm:px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_-10px_rgba(27,110,183,0.55)] hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.65)] hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Generate Sales Team
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
