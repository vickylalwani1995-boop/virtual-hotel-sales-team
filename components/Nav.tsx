"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Phone,
  Sparkles,
  Users,
  BarChart3,
  Menu,
  X,
  Activity as ActivityIcon,
  BookOpen,
} from "lucide-react";
import { MhspLogo } from "@/components/MhspLogo";
import { UserChip } from "@/components/UserChip";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useDemoMode } from "@/lib/demo-mode";
import { getAllLeads } from "@/lib/leads";

export function Nav() {
  const [demo, setDemo] = useDemoMode();
  const [leadCount, setLeadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Live Leads badge
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

  // Esc to close drawer
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Close drawer on navigation so body overflow is always restored.
  // Without this, browser back/forward or programmatic navigation
  // leaves the drawer open and native scrolling can remain locked.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  function toggleDemo() {
    const next = !demo;
    setDemo(next);
    toast.success(
      next ? "Demo Mode on - instant cached outputs" : "Demo Mode off",
    );
  }

  return (
    <>
    <header className="sticky top-0 z-40 backdrop-blur-md bg-mhsp-cream/85 border-b border-mhsp-line">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-16 sm:h-20 flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Logo block */}
        <Link
          href="/"
          className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0"
        >
          <span className="block sm:hidden">
            <MhspLogo height={32} />
          </span>
          <span className="hidden sm:block lg:hidden">
            <MhspLogo height={38} />
          </span>
          <span className="hidden lg:block">
            <MhspLogo height={44} />
          </span>
        </Link>

        <div className="flex-1" />

        {/* DESKTOP — full nav controls (md and up) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4 lg:gap-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-navy hover:text-[#1B6EB7] transition-colors shrink-0"
            aria-label="Dashboard"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>

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

          <Link
            href="/playbooks"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-navy hover:text-[#1B6EB7] transition-colors shrink-0"
            aria-label="Playbooks"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Playbooks</span>
          </Link>

          <Link
            href="/agents"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mhsp-navy hover:text-[#1B6EB7] transition-colors shrink-0"
            aria-label="Sales Team"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Sales Team</span>
          </Link>

          <a
            href="tel:8889091678"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-mhsp-navy hover:text-mhsp-gold transition-colors shrink-0"
            aria-label="Call 888-909-1678"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden lg:inline">888-909-1678</span>
          </a>

          <button
            type="button"
            onClick={toggleDemo}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1.5 text-sm font-semibold transition-all shrink-0 ${
              demo
                ? "border-mhsp-success/40 bg-mhsp-success/10 text-mhsp-success"
                : "border-mhsp-line text-mhsp-muted hover:text-mhsp-navy hover:border-mhsp-navy/30"
            }`}
            title="Toggle Demo Mode"
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

          <NotificationCenter />
          <UserChip />
        </div>

        {/* MOBILE — notification bell + hamburger */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <NotificationCenter />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-mhsp-line bg-white text-mhsp-navy hover:bg-[#F4F8FC] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

      {/* MOBILE DRAWER — rendered outside header to avoid stacking context issues */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-[#0F1B2D]/45 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 right-0 z-50 w-[300px] max-w-[88vw] bg-white shadow-[-20px_0_60px_-20px_rgba(15,76,129,0.30)] flex flex-col md:hidden"
            >
              {/* Drawer header */}
              <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-[#E5ECF4]">
                <MhspLogo height={32} />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-mhsp-muted hover:bg-[#F4F8FC] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-4 py-5">
                <p className="px-3 text-[11px] font-bold tracking-[0.16em] uppercase text-mhsp-muted mb-3">
                  Workspace
                </p>
                <DrawerLink
                  href="/dashboard"
                  Icon={BarChart3}
                  label="Dashboard"
                  active={pathname === "/dashboard"}
                  onClick={() => setDrawerOpen(false)}
                />
                <DrawerLink
                  href="/leads"
                  Icon={Users}
                  label="Leads"
                  badge={leadCount > 0 ? leadCount : undefined}
                  active={pathname === "/leads"}
                  onClick={() => setDrawerOpen(false)}
                />
                <DrawerLink
                  href="/agents"
                  Icon={Sparkles}
                  label="Sales team"
                  active={pathname === "/agents" || pathname?.startsWith("/agent/")}
                  onClick={() => setDrawerOpen(false)}
                />
                <DrawerLink
                  href="/playbooks"
                  Icon={BookOpen}
                  label="Playbooks"
                  active={pathname === "/playbooks" || pathname?.startsWith("/playbooks/")}
                  onClick={() => setDrawerOpen(false)}
                />
                <DrawerLink
                  href="/activity"
                  Icon={ActivityIcon}
                  label="Activity"
                  active={pathname === "/activity"}
                  onClick={() => setDrawerOpen(false)}
                />

                <div className="my-4 mx-3 border-t border-[#E5ECF4]" />
                <p className="px-3 text-[11px] font-bold tracking-[0.16em] uppercase text-mhsp-muted mb-3">
                  Options
                </p>
                <button
                  type="button"
                  onClick={() => {
                    toggleDemo();
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold text-mhsp-navy hover:bg-[#F4F8FC] transition-colors"
                >
                  <span className="inline-flex items-center gap-3">
                    <Sparkles className="h-[18px] w-[18px] shrink-0" />
                    Demo Mode
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                      demo
                        ? "bg-mhsp-success/10 text-mhsp-success"
                        : "bg-[#F3F4F6] text-mhsp-muted"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        demo
                          ? "bg-mhsp-success animate-pulse"
                          : "bg-mhsp-muted/40"
                      }`}
                    />
                    {demo ? "On" : "Off"}
                  </span>
                </button>
                <a
                  href="tel:8889091678"
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold text-mhsp-navy hover:bg-[#F4F8FC] transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Phone className="h-[18px] w-[18px] shrink-0" />
                  888-909-1678
                </a>
              </div>

              {/* Drawer footer — user chip */}
              <div className="border-t border-[#E5ECF4] px-4 py-4">
                <UserChip mobile />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerLink({
  href,
  Icon,
  label,
  badge,
  active,
  onClick,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold transition-colors ${
        active
          ? "bg-[#EAF2FA] text-[#1B6EB7]"
          : "text-mhsp-navy hover:bg-[#F4F8FC]"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">{label}</span>
      {typeof badge === "number" && (
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#1B6EB7] text-white text-xs font-bold font-numeric leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
