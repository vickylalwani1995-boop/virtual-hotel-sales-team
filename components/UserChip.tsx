"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User as UserIcon, RotateCcw } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";
import { resetOnboarding } from "@/lib/onboarding";
import { toast } from "sonner";

export function UserChip({ mobile }: { mobile?: boolean } = {}) {
  const { user, hydrated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!hydrated || !user) return null;

  const initial = user.username.charAt(0).toUpperCase() || "U";

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border border-mhsp-line bg-white hover:border-mhsp-gold/40 hover:bg-mhsp-cream-warm/50 text-sm font-medium text-mhsp-navy transition-colors ${
          mobile ? "w-full pl-1 pr-3 py-1.5" : "pl-1 pr-2.5 py-1"
        }`}
      >
        <span className="inline-flex w-7 h-7 rounded-full bg-mhsp-navy text-white items-center justify-center text-xs font-bold shrink-0">
          {initial}
        </span>
        <span className={mobile ? "flex-1 text-left truncate" : "hidden sm:inline max-w-[100px] truncate"}>
          {user.username}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-mhsp-muted transition-transform shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className={`absolute w-56 rounded-xl border border-mhsp-line bg-white shadow-[0_12px_30px_-12px_rgba(15,76,129,0.25)] overflow-hidden z-50 ${
          mobile ? "bottom-full mb-2 left-0" : "right-0 top-full mt-2"
        }`}>
          <div className="px-4 py-3 border-b border-mhsp-line bg-mhsp-cream-warm/30">
            <div className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 text-mhsp-muted" />
              <p className="text-sm font-semibold text-mhsp-navy truncate">
                {user.username}
              </p>
            </div>
            <p className="text-[14px] text-mhsp-muted mt-0.5">
              Signed in {new Date(user.loggedInAt).toLocaleTimeString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetOnboarding();
              setOpen(false);
              toast.success("Onboarding reset — go to the home page to see it again.");
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-mhsp-text hover:bg-mhsp-cream-warm/50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-mhsp-muted" />
            Reset onboarding
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-mhsp-text hover:bg-mhsp-cream-warm/50 transition-colors"
          >
            <LogOut className="h-4 w-4 text-mhsp-muted" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
