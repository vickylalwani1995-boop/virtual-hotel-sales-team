"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDemoMode } from "@/lib/demo-mode";

/**
 * Top-of-screen banner shown while the browser reports the device
 * is offline. Auto-enables Demo Mode so cached responses keep
 * working until connection is back. Once we go back online, Demo
 * Mode stays on (user can toggle it off in the nav) but a toast
 * acknowledges the recovery.
 *
 * Mount once globally inside AppChrome.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [demo, setDemo] = useDemoMode();
  const autoEnabledRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof navigator !== "undefined") {
      setOffline(!navigator.onLine);
    }
    function goOffline() {
      setOffline(true);
    }
    function goOnline() {
      setOffline(false);
      if (autoEnabledRef.current) {
        toast.success("Back online — Demo Mode is still on (toggle in nav).");
        autoEnabledRef.current = false;
      }
    }
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // Auto-enable Demo Mode the first time we go offline. Don't keep
  // flipping it back on if the user manually toggles it off later.
  useEffect(() => {
    if (offline && !demo && !autoEnabledRef.current) {
      autoEnabledRef.current = true;
      setDemo(true);
      toast.info(
        "You're offline. Demo Mode is on — cached responses will play.",
      );
    }
  }, [offline, demo, setDemo]);

  if (!hydrated) return null;

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          role="status"
          aria-live="polite"
          className="sticky top-0 z-[60] w-full bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#B91C1C] text-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span className="text-sm font-bold tracking-wide">
              You&apos;re offline.
            </span>
            <span className="text-sm text-white/90">
              Demo Mode is active — cached responses will keep working until
              you&apos;re back.
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-2.5 py-1 text-sm font-bold uppercase tracking-[0.12em]">
              <Sparkles className="h-3 w-3" />
              Demo Mode on
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
