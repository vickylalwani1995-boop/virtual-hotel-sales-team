export type ActivityEntry =
  | {
      type: "agent_run";
      id: string;
      agentId: string;
      agentName: string;
      timestamp: string;
      preview: string;
      isSample?: boolean;
    }
  | {
      type: "email_queued";
      id: string;
      agentId: string;
      subject: string;
      timestamp: string;
      preview: string;
    };

const KEY = "vhst-activity-log";
const MAX_ENTRIES = 200;

export function getActivity(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type DistributiveOmit<T, K extends keyof never> = T extends unknown
  ? Omit<T, K>
  : never;

type LogInput = DistributiveOmit<ActivityEntry, "id" | "timestamp"> & {
  id?: string;
  timestamp?: string;
};

export function logActivity(entry: LogInput) {
  if (typeof window === "undefined") return;
  const full: ActivityEntry = {
    ...entry,
    id: entry.id ?? `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  } as ActivityEntry;
  const list = getActivity();
  list.unshift(full);
  const trimmed = list.slice(0, MAX_ENTRIES);
  window.localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function clearActivity() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
