"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AgentGrid } from "@/components/AgentGrid";
import { ArrowLeft } from "lucide-react";

function extractHotelName(profile: string): string {
  const m = profile.match(/Hotel\s*Name\s*:\s*([^\n]+)/i);
  if (m) return m[1].trim();
  const firstLine = profile.split("\n")[0]?.trim() ?? "";
  return firstLine.length > 0 && firstLine.length < 60 ? firstLine : "your hotel";
}

function profileChips(profile: string): { label: string; value: string }[] {
  const fields = ["Location", "Rooms", "Average Daily Rate", "Current Occupancy", "Brand"];
  const out: { label: string; value: string }[] = [];
  for (const f of fields) {
    const re = new RegExp(`${f}\\s*:\\s*([^\\n]+)`, "i");
    const m = profile.match(re);
    if (m) out.push({ label: f, value: m[1].trim() });
  }
  return out;
}

function AgentsContent() {
  const searchParams = useSearchParams();
  const profile = searchParams.get("profile") ?? "";
  const hotelName = extractHotelName(profile);
  const chips = profileChips(profile);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-mhsp-muted hover:text-mhsp-navy transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Edit hotel profile
      </Link>

      <div className="mb-8">
        <p className="eyebrow">Sales Team</p>
        <h1 className="font-display text-4xl text-mhsp-navy mt-2">
          Your sales team for {hotelName}
        </h1>
        <p className="text-mhsp-muted mt-2">
          11 specialist AI agents — meet the team.
        </p>
      </div>

      {profile && chips.length > 0 && (
        <div className="bg-white rounded-2xl border border-mhsp-line p-5 mb-10 shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-mhsp-cream-warm border border-mhsp-line/60 px-3 py-1 text-xs"
              >
                <span className="text-mhsp-muted">{c.label}:</span>
                <span className="font-semibold text-mhsp-navy">{c.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {profile ? (
        <AgentGrid profile={profile} />
      ) : (
        <div className="bg-white rounded-2xl border border-mhsp-line border-dashed p-10 text-center">
          <p className="text-mhsp-muted mb-4">
            No hotel profile yet — add one to enable the agents.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-mhsp-gold hover:bg-mhsp-gold-soft px-5 py-2.5 text-sm font-semibold text-mhsp-navy"
          >
            Add hotel profile
          </Link>
        </div>
      )}
    </main>
  );
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-mhsp-muted">Loading…</div>}>
      <AgentsContent />
    </Suspense>
  );
}
