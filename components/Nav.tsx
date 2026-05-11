"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Phone, Sparkles, Users } from "lucide-react";
import { MhspLogo } from "@/components/MhspLogo";
import { UserChip } from "@/components/UserChip";
import { useDemoMode } from "@/lib/demo-mode";
import { getAllLeads } from "@/lib/leads";

export function Nav() {
  const [demo, setDemo] = useDemoMode();
  const [leadCount, setLeadCount] = useState(0);

  // Keep the Leads badge live: read on mount, refresh on
  // window events emitted by the leads helpers.
  useEffect(() => {
    const sync = () => setLeadCount(getAllLeads().length);
    sync();
    window.addEventListener("vhst-leads-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vhst-leads-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function toggle() {
    const next = !demo;
    setDemo(next);
    toast.success(
      next ? "Demo Mode on - instant cached outputs" : "Demo Mode off",
    );
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-mhsp-cream/85 border-b border-mhsp-line">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-16 sm:h-20 flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Logo block - scales with breakpoint */}
        <Link
          href="/"
          className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0"
        >
          {/* Mobile logo */}
          <span className="block sm:hidden">
            <MhspLogo height={32} />
          </span>
          {/* Tablet logo */}
          <span className="hidden sm:block lg:hidden">
            <MhspLogo height={38} />
          </span>
          {/* Desktop logo */}
          <span className="hidden lg:block">
            <MhspLogo height={44} />
          </span>
        </Link>

        <div className="flex-1" />

        {/* Leads link with count badge */}
        <Link
          data-tour="nav-leads"
          href="/leads"
          className="relative inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-navy hover:text-[#1B6EB7] transition-colors shrink-0"
          aria-label={`Leads (${leadCount})`}
        >
          <Users className="h-4 w-4" />
          <span className="hidden md:inline">Leads</span>
          {leadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#1B6EB7] text-white text-sm font-bold font-numeric leading-none">
              {leadCount > 99 ? "99+" : leadCount}
            </span>
          )}
        </Link>

        {/* Phone - hidden on mobile, icon-only on tablet, full on desktop */}
        <a
          href="tel:8889091678"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-mhsp-navy hover:text-mhsp-gold transition-colors shrink-0"
          aria-label="Call 888-909-1678"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden lg:inline">888-909-1678</span>
        </a>

        {/* Demo Mode toggle - compact on mobile, expanded on desktop */}
        <button
          type="button"
          onClick={toggle}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1.5 text-sm font-semibold transition-all shrink-0 ${
            demo
              ? "border-mhsp-success/40 bg-mhsp-success/10 text-mhsp-success"
              : "border-mhsp-line text-mhsp-muted hover:text-mhsp-navy hover:border-mhsp-navy/30"
          }`}
          title="Toggle Demo Mode (instant cached responses)"
          aria-label="Toggle Demo Mode"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              demo ? "bg-mhsp-success animate-pulse" : "bg-mhsp-muted/40"
            }`}
          />
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Demo Mode</span>
        </button>

        <UserChip />
      </div>
    </header>
  );
}
