"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Sparkles,
  Mail,
  CalendarClock,
  Flame,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Check,
  Trash2,
  X,
} from "lucide-react";
import {
  clearAll,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  subscribeNotifications,
  type Notification,
  type NotificationType,
} from "@/lib/notifications";

const TYPE_META: Record<
  NotificationType,
  {
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    tone: string; // tile bg/text
  }
> = {
  lead: {
    Icon: UserPlus,
    tone: "bg-[#EAF2FA] text-[#0F4C81]",
  },
  email: {
    Icon: Mail,
    tone: "bg-[#E3F1FA] text-[#1B6EB7]",
  },
  sequence: {
    Icon: CalendarClock,
    tone: "bg-[#F5F3FF] text-[#6D28D9]",
  },
  high_value: {
    Icon: Flame,
    tone: "bg-[#FEF3C7] text-[#92400E]",
  },
  action: {
    Icon: AlertCircle,
    tone: "bg-[#FEE2E2] text-[#B91C1C]",
  },
  completed: {
    Icon: CheckCircle2,
    tone: "bg-mhsp-success/10 text-mhsp-success",
  },
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  const sync = useCallback(() => {
    setNotifications(getNotifications());
    setUnread(getUnreadCount());
  }, []);

  useEffect(() => {
    sync();
    setHydrated(true);
    return subscribeNotifications(sync);
  }, [sync]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside to close
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (
        popoverRef.current?.contains(t) ||
        buttonRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const list = useMemo(
    () =>
      tab === "unread" ? notifications.filter((n) => !n.read) : notifications,
    [notifications, tab],
  );

  function handleClick(n: Notification) {
    if (!n.read) {
      markAsRead(n.id);
      sync();
    }
    if (n.actionUrl) {
      router.push(n.actionUrl);
      setOpen(false);
    }
  }

  function handleMarkAllRead() {
    markAllAsRead();
    sync();
  }

  function handleClearAll() {
    clearAll();
    sync();
  }

  // Render nothing until hydrated to avoid SSR mismatch on the badge
  if (!hydrated) {
    return (
      <button
        type="button"
        aria-label="Notifications"
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-mhsp-line bg-white text-mhsp-navy shrink-0"
      >
        <Bell className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className={`relative inline-flex items-center justify-center h-9 w-9 rounded-full border bg-white text-mhsp-navy hover:bg-[#F4F8FC] transition-colors ${
          open
            ? "border-[#1B6EB7] ring-4 ring-[#1B6EB7]/15"
            : "border-mhsp-line hover:border-[#1B6EB7]/40"
        }`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-sm font-bold font-numeric leading-none ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop (sm- only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="sm:hidden fixed inset-0 z-40 bg-[#0F1B2D]/40 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* Panel — full-screen-ish on mobile, popover on sm+ */}
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
              role="dialog"
              aria-label="Notifications"
              className="fixed sm:absolute inset-x-3 top-[68px] sm:top-auto sm:inset-auto sm:right-0 sm:mt-2 z-50 sm:w-[380px] rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
            >
              {/* Top accent strip */}
              <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />

              {/* Header */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
                <h2 className="font-heading text-base font-bold text-mhsp-navy">
                  Notifications
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={unread === 0}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#1B6EB7] hover:text-[#0F4C81] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark all
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={notifications.length === 0}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-mhsp-muted hover:text-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="sm:hidden inline-flex items-center justify-center h-6 w-6 rounded-md text-mhsp-muted hover:bg-[#F4F8FC] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-4 pb-2 flex items-center gap-1 border-b border-[#E5ECF4]">
                <TabButton
                  active={tab === "all"}
                  onClick={() => setTab("all")}
                  count={notifications.length}
                >
                  All
                </TabButton>
                <TabButton
                  active={tab === "unread"}
                  onClick={() => setTab("unread")}
                  count={unread}
                  highlight
                >
                  Unread
                </TabButton>
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto">
                {list.length === 0 ? (
                  <EmptyState unreadOnly={tab === "unread"} />
                ) : (
                  <ul className="divide-y divide-[#F1F4F8]">
                    {list.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        onClick={() => handleClick(n)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------- subcomponents -------- */

function TabButton({
  active,
  count,
  onClick,
  highlight = false,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold tracking-wide transition-colors ${
        active ? "text-[#1B6EB7]" : "text-mhsp-muted hover:text-mhsp-navy"
      }`}
    >
      {children}
      {count > 0 && (
        <span
          className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-sm font-bold font-numeric leading-none ${
            highlight && count > 0
              ? "bg-[#DC2626] text-white"
              : "bg-[#EAF2FA] text-[#0F4C81]"
          }`}
        >
          {count}
        </span>
      )}
      {active && (
        <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-[#1B6EB7] rounded-full" />
      )}
    </button>
  );
}

function NotificationRow({
  notification: n,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const meta = TYPE_META[n.type] ?? TYPE_META.completed;
  const Icon = meta.Icon;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors ${
          !n.read ? "bg-[#FAFCFE]" : ""
        }`}
      >
        {/* Unread dot */}
        <span
          aria-hidden="true"
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            n.read ? "bg-transparent" : "bg-mhsp-gold"
          }`}
        />
        {/* Type icon tile */}
        <div
          className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${meta.tone}`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </div>
        {/* Body */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-mhsp-navy leading-tight">
            {n.title}
          </p>
          {n.description && (
            <p className="mt-0.5 text-sm text-mhsp-muted leading-snug line-clamp-2">
              {n.description}
            </p>
          )}
          <p className="mt-1 text-sm text-mhsp-muted/80 font-numeric">
            {timeAgo(n.timestamp)}
          </p>
        </div>
      </button>
    </li>
  );
}

function EmptyState({ unreadOnly }: { unreadOnly: boolean }) {
  return (
    <div className="px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 0.61, 0.36, 1],
        }}
        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] text-white shadow-[0_8px_22px_-8px_rgba(27,110,183,0.5)]"
      >
        <Sparkles className="h-5 w-5" strokeWidth={2.25} />
      </motion.div>
      <p className="mt-3 font-heading text-base font-bold text-mhsp-navy">
        All caught up! 🎉
      </p>
      <p className="mt-1 text-sm text-mhsp-muted">
        {unreadOnly
          ? "No unread notifications right now."
          : "Agent activity will show up here as it happens."}
      </p>
    </div>
  );
}

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "—";
  }
}
