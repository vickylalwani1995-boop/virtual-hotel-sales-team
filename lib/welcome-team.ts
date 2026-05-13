import type { Agent } from "@/lib/agents";

const KEY = "vhst-welcome-team";

export type WelcomeAgentProfile = {
  id: string;
  realName: string;
  designation: string;
  photo: string;
};

export const DEFAULT_AGENT_PHOTOS: Record<string, string> = {
  "01_director": "https://randomuser.me/api/portraits/women/44.jpg",
  "02_lead_gen": "https://randomuser.me/api/portraits/men/32.jpg",
  "03_outbound": "https://randomuser.me/api/portraits/women/26.jpg",
  "04_rfp_group": "https://randomuser.me/api/portraits/women/67.jpg",
  "05_retention": "https://randomuser.me/api/portraits/men/75.jpg",
  "06_revenue": "https://randomuser.me/api/portraits/women/11.jpg",
};

export function getDefaultPhoto(id: string): string {
  return DEFAULT_AGENT_PHOTOS[id] ?? "";
}

export function saveWelcomeTeam(agents: readonly Agent[]): void {
  if (typeof window === "undefined") return;
  const payload: WelcomeAgentProfile[] = agents.map((agent) => ({
    id: agent.id,
    realName: agent.realName,
    designation: agent.designation,
    photo: getDefaultPhoto(agent.id),
  }));
  window.localStorage.setItem(KEY, JSON.stringify(payload));
}

export function getWelcomeTeamMap(): Record<string, WelcomeAgentProfile> {
  const map: Record<string, WelcomeAgentProfile> = {};
  if (typeof window === "undefined") return map;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return map;
    const parsed = JSON.parse(raw) as WelcomeAgentProfile[];
    for (const item of parsed) {
      if (item?.id) map[item.id] = item;
    }
  } catch {
    return map;
  }
  return map;
}

export function getWelcomeAgent(agent: Agent): WelcomeAgentProfile {
  const map = getWelcomeTeamMap();
  const fromWelcome = map[agent.id];
  return {
    id: agent.id,
    realName: fromWelcome?.realName || agent.realName,
    designation: fromWelcome?.designation || agent.designation,
    photo: fromWelcome?.photo || getDefaultPhoto(agent.id),
  };
}
