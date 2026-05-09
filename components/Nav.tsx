"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, RotateCcw, Sparkles } from "lucide-react";
import { MhspLogo, InntelligentBadge } from "@/components/MhspLogo";
import { UserChip } from "@/components/UserChip";
import { useDemoMode, resetDemo } from "@/lib/demo-mode";

export function Nav() {
  const [demo, setDemo] = useDemoMode();
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  function toggle() {
    const next = !demo;
    setDemo(next);
    toast.success(next ? "Demo Mode on — instant cached outputs" : "Demo Mode off");
  }

  function handleReset() {
    setResetting(true);
    resetDemo();
    toast.success("Demo reset — local data cleared");
    setTimeout(() => {
      setResetting(false);
      router.push("/");
      router.refresh();
    }, 200);
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-mhsp-cream/85 border-b border-mhsp-line">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-4 shrink-0">
          <MhspLogo height={44} />
          <InntelligentBadge className="hidden md:inline-flex" height={26} />
        </Link>

        <Link href="/" className="hidden lg:block ml-2 pl-6 border-l border-mhsp-line">
          <span className="font-display text-lg text-mhsp-navy leading-none">
            my <span className="italic">Sales</span>{" "}
            <span className="text-mhsp-gold">TEAM AI</span>
          </span>
        </Link>

        <div className="flex-1" />

        <a
          href="tel:8889091678"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-mhsp-navy hover:text-mhsp-gold transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          888-909-1678
        </a>

        <Link
          href="/agents"
          className="text-sm font-medium text-mhsp-navy/70 hover:text-mhsp-navy transition-colors"
        >
          Team
        </Link>
        <Link
          href="/activity"
          className="text-sm font-medium text-mhsp-navy/70 hover:text-mhsp-navy transition-colors"
        >
          Activity
        </Link>

        <button
          type="button"
          onClick={toggle}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
            demo
              ? "border-mhsp-success/40 bg-mhsp-success/10 text-mhsp-success"
              : "border-mhsp-line text-mhsp-muted hover:text-mhsp-navy hover:border-mhsp-navy/30"
          }`}
          title="Toggle Demo Mode (instant cached responses)"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              demo ? "bg-mhsp-success animate-pulse" : "bg-mhsp-muted/40"
            }`}
          />
          <Sparkles className="h-3 w-3" />
          Demo Mode
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-1 text-sm font-medium text-mhsp-muted hover:text-mhsp-navy transition-colors disabled:opacity-50"
          title="Clear localStorage and return home"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>

        <UserChip />
      </div>
    </header>
  );
}
