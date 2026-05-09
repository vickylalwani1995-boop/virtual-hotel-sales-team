"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RotateCcw } from "lucide-react";
import { useDemoMode } from "@/lib/demo-mode";

const DEFAULT_PROFILE = `Hotel Name: The Westmore Hotel Dallas
Location: Downtown Dallas, Texas, USA
Rooms: 220
Target Business: Corporate, Group Meetings, Medical, Long-Stay Project Teams
Weak Days: Sunday to Tuesday
Main Need: More weekday corporate occupancy + group business
Meeting Space: Yes — 4 banquet halls, max 600 pax
Catering: Yes — in-house + outdoor catering
Brand: Independent boutique
Average Daily Rate: $189
Current Occupancy: 62%`;

export function HotelInput() {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [demo] = useDemoMode();

  function handleSubmit() {
    const value = profile.trim();
    if (!value) return;
    router.push(`/agents?profile=${encodeURIComponent(value)}`);
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(11,36,71,0.18)] border border-mhsp-line/60 overflow-hidden">
      <div className="px-7 pt-6 pb-4 border-b border-mhsp-line/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-mhsp-navy">
              Tell us about your hotel
            </h2>
            <p className="text-sm text-mhsp-muted mt-0.5">
              Your AI sales team will be ready in 60 seconds
            </p>
          </div>
          {demo && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mhsp-success/40 bg-mhsp-success/10 px-2.5 py-1 text-[11px] font-semibold text-mhsp-success">
              <span className="h-1.5 w-1.5 rounded-full bg-mhsp-success animate-pulse" />
              Demo Mode
            </span>
          )}
        </div>
      </div>

      <div className="px-7 py-5">
        <textarea
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="Describe your hotel — name, location, rooms, target market, weak days, main need..."
          className="w-full min-h-64 resize-none font-mono text-sm leading-relaxed bg-mhsp-cream/40 border border-mhsp-line rounded-lg px-4 py-3 text-mhsp-text placeholder:text-mhsp-muted/70 focus:outline-none focus:ring-2 focus:ring-mhsp-gold/30 focus:border-mhsp-gold/50 transition-all"
        />
      </div>

      <div className="px-7 pb-6 pt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setProfile(DEFAULT_PROFILE)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mhsp-muted hover:text-mhsp-navy transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to sample
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!profile.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-mhsp-gold hover:bg-mhsp-gold-soft disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-mhsp-navy shadow-[0_4px_14px_-4px_rgba(212,165,55,0.6)] hover:shadow-[0_6px_20px_-4px_rgba(212,165,55,0.7)] transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Generate Sales Team
        </button>
      </div>
    </div>
  );
}
