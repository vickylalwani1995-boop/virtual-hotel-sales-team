"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

/**
 * Global keyboard shortcuts + the "?" cheat-sheet modal.
 *
 * Bindings:
 *   Cmd/Ctrl + K   → open myConcierge (already handled inside Concierge.tsx
 *                    — we only LIST it here, not re-bind, to avoid double fire)
 *   Cmd/Ctrl + G   → go home + scroll to "Get Started" form
 *   Cmd/Ctrl + L   → /leads
 *   Cmd/Ctrl + D   → /dashboard
 *   Cmd/Ctrl + /   → toggle this shortcuts modal
 *   Esc            → close modal
 *
 * Mount once globally (AppChrome) — it has no rendered DOM until the
 * modal opens, so it's cheap.
 */

type Shortcut = { keys: string[]; label: string };

const SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], label: "Open myConcierge chat" },
  { keys: ["⌘", "G"], label: "Generate Sales Team (home)" },
  { keys: ["⌘", "L"], label: "Open Lead Manager" },
  { keys: ["⌘", "D"], label: "Open Dashboard" },
  { keys: ["⌘", "/"], label: "Show keyboard shortcuts" },
  { keys: ["Esc"], label: "Close any open modal / drawer" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  useHotkeys(
    "mod+g",
    (e) => {
      e.preventDefault();
      router.push("/#start");
    },
    { enableOnFormTags: false },
  );
  useHotkeys(
    "mod+l",
    (e) => {
      e.preventDefault();
      router.push("/leads");
    },
    { enableOnFormTags: false },
  );
  useHotkeys(
    "mod+d",
    (e) => {
      e.preventDefault();
      router.push("/dashboard");
    },
    { enableOnFormTags: false },
  );
  useHotkeys(
    "mod+/",
    (e) => {
      e.preventDefault();
      setModalOpen((o) => !o);
    },
    { enableOnFormTags: true },
  );

  // Esc to close modal
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[80] bg-[#0F1B2D]/55 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
            className="fixed left-1/2 top-1/2 z-[90] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white flex items-center justify-center shadow-[0_8px_22px_-8px_rgba(15,76,129,0.55)]">
                  <Keyboard className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    id="keyboard-shortcuts-title"
                    className="font-heading text-xl font-bold text-mhsp-navy leading-tight"
                  >
                    Keyboard shortcuts
                  </h2>
                  <p className="mt-1 text-sm text-mhsp-muted">
                    Use <Kbd>⌘</Kbd> on macOS or <Kbd>Ctrl</Kbd> on Windows /
                    Linux.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                  className="shrink-0 h-8 w-8 rounded-lg hover:bg-[#F4F8FC] flex items-center justify-center text-mhsp-muted hover:text-mhsp-navy transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ul className="mt-5 space-y-1.5">
                {SHORTCUTS.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-[#F4F8FC] transition-colors"
                  >
                    <span className="text-sm text-mhsp-text font-medium">
                      {s.label}
                    </span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      {s.keys.map((k, i) => (
                        <Kbd key={`${s.label}-${i}`}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[26px] h-7 px-1.5 rounded-md border border-[#DCE5EF] bg-[#F4F8FC] text-mhsp-navy text-sm font-bold font-numeric shadow-[inset_0_-1px_0_rgba(15,76,129,0.10)]">
      {children}
    </kbd>
  );
}
