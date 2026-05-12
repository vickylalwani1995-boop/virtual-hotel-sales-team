"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, PencilLine } from "lucide-react";
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
} from "@/lib/onboarding";

const CLEAR_PROFILE_EVENT = "vhst-clear-hotel-profile";
const ONBOARDING_CHANGED = "vhst-onboarding-changed";

/**
 * Welcome modal shown once on first visit to "/".
 *
 * Replaced the previous react-joyride implementation which caused two
 * issues:
 *  1. A visible circular beacon in the centre of the screen that could
 *     not be fully suppressed via disableBeacon.
 *  2. Joyride locks body scroll (overflow:hidden) while the spotlight
 *     is active, which caused Lenis to see a locked body and stop
 *     responding to wheel events until the page was reloaded.
 *
 * The welcome modal achieves the same onboarding goal — guide the user
 * to either the Westmore demo or their own profile — without any of
 * those side-effects.
 */
export function OnboardingTour() {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Show modal on first visit to home page
  useEffect(() => {
    setHydrated(true);
    if (pathname !== "/") return;
    if (!isOnboardingCompleted()) {
      const t = setTimeout(() => setModalOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // Re-show when user resets onboarding from UserChip
  useEffect(() => {
    function onChanged() {
      if (pathname === "/" && !isOnboardingCompleted()) {
        setModalOpen(true);
      }
    }
    window.addEventListener(ONBOARDING_CHANGED, onChanged);
    return () => window.removeEventListener(ONBOARDING_CHANGED, onChanged);
  }, [pathname]);

  function handleUseWestmore() {
    setModalOpen(false);
    setOnboardingCompleted();
  }

  function handleEnterOwn() {
    setModalOpen(false);
    setOnboardingCompleted();
    window.dispatchEvent(new CustomEvent(CLEAR_PROFILE_EVENT));
  }

  if (!hydrated) return null;
  if (pathname !== "/") return null;

  return (
    <AnimatePresence>
      {modalOpen && (
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
            aria-labelledby="onboarding-title"
            className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />
            <div className="p-6 sm:p-7 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white shadow-[0_8px_22px_-8px_rgba(15,76,129,0.55)]">
                <Sparkles className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h2
                id="onboarding-title"
                className="mt-4 font-heading text-2xl font-bold text-mhsp-navy leading-tight"
              >
                Welcome to my Sales TEAM AI.
              </h2>
              <p className="mt-2 text-base text-mhsp-muted leading-relaxed max-w-sm mx-auto">
                Start with the{" "}
                <strong className="text-mhsp-navy">Westmore Hotel Dallas</strong>{" "}
                demo profile, or enter your own hotel?
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
  );
}
