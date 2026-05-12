import type { Agent } from "@/lib/agents";

const KEY = "vhst-welcome-team";

export type WelcomeAgentProfile = {
  id: string;
  realName: string;
  jobTitle: string;
  mhspRole: string;
  photo: string;
};

export const DEFAULT_AGENT_PHOTOS: Record<string, string> = {
  "00_director_of_sales": "https://randomuser.me/api/portraits/women/44.jpg",
  "01_lead_generation": "https://randomuser.me/api/portraits/men/32.jpg",
  "02_outbound_sales": "https://randomuser.me/api/portraits/women/26.jpg",
  "03_account_manager": "https://randomuser.me/api/portraits/men/56.jpg",
  "04_rfp_closing": "https://randomuser.me/api/portraits/women/67.jpg",
  "05_lnr_closing": "https://randomuser.me/api/portraits/men/41.jpg",
  "06_group_sales": "https://randomuser.me/api/portraits/men/12.jpg",
  "07_meeting_catering": "https://randomuser.me/api/portraits/women/68.jpg",
  "08_after_sales": "https://randomuser.me/api/portraits/men/75.jpg",
  "09_retention": "https://randomuser.me/api/portraits/women/22.jpg",
  "10_revenue_leadership": "https://randomuser.me/api/portraits/women/11.jpg",
};

export function getDefaultPhoto(id: string): string {
  return DEFAULT_AGENT_PHOTOS[id] ?? "";
}

export function saveWelcomeTeam(agents: readonly Agent[]): void {
  if (typeof window === "undefined") return;
  const payload: WelcomeAgentProfile[] = agents.map((agent) => ({
    id: agent.id,
    realName: agent.realName,
    jobTitle: agent.jobTitle,
    mhspRole: agent.mhspRole,
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
    jobTitle: fromWelcome?.jobTitle || agent.jobTitle,
    mhspRole: fromWelcome?.mhspRole || agent.mhspRole,
    photo: fromWelcome?.photo || getDefaultPhoto(agent.id),
  };
}
