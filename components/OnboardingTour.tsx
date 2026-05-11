"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, PencilLine } from "lucide-react";
import { Joyride, type EventData, type Step } from "react-joyride";
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
} from "@/lib/onboarding";

const CLEAR_PROFILE_EVENT = "vhst-clear-hotel-profile";
const ONBOARDING_CHANGED = "vhst-onboarding-changed";

// disableBeacon=true on every step kills react-joyride's default
// pulsing dot (the "black dot") and pops the tooltip directly with
// the target highlighted — premium, not toddler-tutorial energy.
// Type annotation is loosened because the bundled react-joyride
// type defs don't expose disableBeacon on Step in this version,
// even though the runtime supports it. Cast at usage site.
const STEPS = [
  {
    target: '[data-tour="hotel-input"]',
    content:
      "Welcome to my Sales TEAM AI! Start by describing your hotel — name, location, target business, weak days. Paste a quick profile and your AI sales team reads it in seconds.",
    placement: "top" as const,
    disableBeacon: true,
  },
  {
    target: '[data-tour="generate-btn"]',
    content:
      "Click here to build your virtual sales department. Eleven specialist agents, ready in seconds.",
    placement: "top" as const,
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-leads"]',
    content:
      "Every prospect your agents surface lands here — a 21-column CRM table with search, filters, status tracking, and CSV / Excel export.",
    placement: "bottom" as const,
    disableBeacon: true,
  },
  {
    target: '[data-tour="concierge-bell"]',
    content:
      "Stuck? Ask myConcierge — your AI sales co-pilot — anything, anywhere. Press ⌘K to open it from anywhere too.",
    placement: "left" as const,
    disableBeacon: true,
  },
];

// Brand-tinted joyride styles (blue palette + premium card frame).
// Spotlight + beacon are also overridden in case any fallback fires.
const JOYRIDE_STYLES = {
  options: {
    primaryColor: "#1B6EB7",
    backgroundColor: "#FFFFFF",
    textColor: "#0F1B2D",
    arrowColor: "#FFFFFF",
    overlayColor: "rgba(15, 27, 45, 0.55)",
    zIndex: 1000,
  },
  // Spotlight cutout uses joyride's SVG path attrs — leaving default
  // since the dimmed overlay color + softened tooltip already read
  // premium. The disableBeacon flag on each Step kills the dark
  // pulsing dot, which was the actual visible issue.
  beaconInner: {
    backgroundColor: "#1B6EB7",
  },
  beaconOuter: {
    backgroundColor: "rgba(27,110,183,0.3)",
    border: "2px solid #1B6EB7",
  },
  tooltip: {
    borderRadius: 16,
    padding: 0,
    boxShadow:
      "0 30px 80px -20px rgba(15,76,129,0.30), 0 8px 24px -8px rgba(15,76,129,0.12)",
    border: "1px solid #E5ECF4",
    overflow: "hidden",
    maxWidth: 380,
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  tooltipContent: {
    padding: "16px 20px 4px 20px",
    fontSize: 14,
    lineHeight: 1.6,
  },
  buttonNext: {
    background: "#1B6EB7",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    borderRadius: 10,
    padding: "10px 18px",
    boxShadow: "0 8px 18px -8px rgba(27,110,183,0.5)",
  },
  buttonBack: {
    color: "#5A6B82",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 8,
  },
  buttonSkip: {
    color: "#5A6B82",
    fontSize: 13,
    fontWeight: 600,
  },
  buttonClose: {
    display: "none",
  },
};

export function OnboardingTour() {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [finalModalOpen, setFinalModalOpen] = useState(false);

  // Hydrate + decide whether to run
  useEffect(() => {
    setHydrated(true);
    if (pathname !== "/") return;
    if (!isOnboardingCompleted()) {
      // Wait a tick so data-tour targets are mounted
      const t = setTimeout(() => setTourActive(true), 400);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // Listen for "reset onboarding" event from UserChip
  useEffect(() => {
    function onChanged() {
      // If flag was cleared and we're on home, restart the tour.
      if (pathname === "/" && !isOnboardingCompleted()) {
        setTourActive(true);
      }
    }
    window.addEventListener(ONBOARDING_CHANGED, onChanged);
    return () => window.removeEventListener(ONBOARDING_CHANGED, onChanged);
  }, [pathname]);

  function handleJoyride(data: EventData) {
    const { status, type, action } = data;
    if (status === "finished") {
      setTourActive(false);
      setFinalModalOpen(true);
      return;
    }
    if (status === "skipped" || (type === "tour:end" && action === "close")) {
      setTourActive(false);
      setOnboardingCompleted();
    }
  }

  function handleUseWestmore() {
    setFinalModalOpen(false);
    setOnboardingCompleted();
    const el = document.querySelector(
      '[data-tour="hotel-input"]',
    ) as HTMLTextAreaElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  }

  function handleEnterOwn() {
    setFinalModalOpen(false);
    setOnboardingCompleted();
    // Tell HotelInput to wipe its profile state
    window.dispatchEvent(new CustomEvent(CLEAR_PROFILE_EVENT));
    const el = document.querySelector(
      '[data-tour="hotel-input"]',
    ) as HTMLTextAreaElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  }

  if (!hydrated) return null;
  if (pathname !== "/") return null;

  return (
    <>
      {tourActive && (
        <Joyride
          steps={STEPS}
          run={tourActive}
          continuous
          scrollToFirstStep
          onEvent={handleJoyride}
          styles={JOYRIDE_STYLES}
          locale={{
            back: "Back",
            close: "Close",
            last: "Finish",
            next: "Next",
            skip: "Skip tour",
          }}
        />
      )}

      <AnimatePresence>
        {finalModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[110] bg-[#0F1B2D]/55 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="onboarding-final-title"
              className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />
              <div className="p-6 sm:p-7 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white shadow-[0_8px_22px_-8px_rgba(15,76,129,0.55)]">
                  <Sparkles className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <h2
                  id="onboarding-final-title"
                  className="mt-4 font-heading text-2xl font-bold text-mhsp-navy leading-tight"
                >
                  You&apos;re ready.
                </h2>
                <p className="mt-2 text-base text-mhsp-muted leading-relaxed max-w-sm mx-auto">
                  Let&apos;s start with the <strong>Westmore Hotel
                  Dallas</strong> demo profile, or enter your own hotel?
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleUseWestmore}
                    autoFocus
                    className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:-translate-y-0.5 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Use Westmore demo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={handleEnterOwn}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-4 py-3 text-sm font-semibold transition-colors"
                  >
                    <PencilLine className="h-4 w-4" />
                    I&apos;ll enter my own
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
