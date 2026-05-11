import { nanoid } from "nanoid";

export type NotificationType =
  | "lead"
  | "email"
  | "sequence"
  | "high_value"
  | "action"
  | "completed";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  agentId?: string;
  actionUrl?: string;
}

const STORAGE_KEY = "vhst-notifications";
const MAX_NOTIFICATIONS = 100;
const EVT = "vhst-notifications-changed";

function readAll(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is Notification =>
        n &&
        typeof n === "object" &&
        typeof n.id === "string" &&
        typeof n.timestamp === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(list: Notification[]): void {
  if (typeof window === "undefined") return;
  // Newest first, capped at MAX_NOTIFICATIONS
  const sorted = [...list].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
  const trimmed = sorted.slice(0, MAX_NOTIFICATIONS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
    // localStorage quota — silently drop
  }
}

export function addNotification(
  input: Omit<Notification, "id" | "timestamp" | "read">,
): Notification {
  const n: Notification = {
    ...input,
    id: nanoid(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  writeAll([n, ...readAll()]);
  return n;
}

export function getNotifications(): Notification[] {
  // Returned sorted newest-first (writeAll already keeps it that way,
  // but re-sort defensively in case storage was written from another tab)
  return [...readAll()].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function markAsRead(id: string): void {
  writeAll(
    readAll().map((n) => (n.id === id ? { ...n, read: true } : n)),
  );
}

export function markAllAsRead(): void {
  writeAll(readAll().map((n) => ({ ...n, read: true })));
}

export function clearAll(): void {
  writeAll([]);
}

export function getUnreadCount(): number {
  return readAll().filter((n) => !n.read).length;
}

/** Convenience: subscribe to changes (same-tab + cross-tab). */
export function subscribeNotifications(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const fn = () => handler();
  window.addEventListener(EVT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVT, fn);
    window.removeEventListener("storage", fn);
  };
}
