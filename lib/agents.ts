export const AGENTS = [
  {
    id: "01_director",
    realName: "Donna Marie",
    designation: "Director of Sales",
    funnel: "calculated" as const,
    isCaptain: true,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    description:
      "Owns the weekly sales plan. Briefs every agent. Reports to ownership. The team's single source of truth.",
    capabilities: [
      "weekly sales plan",
      "team coordination",
      "ownership reporting",
      "pipeline review",
      "strategy setting",
    ],
    solvesProblem:
      "No one is steering the ship — the Director creates the plan and makes sure every agent executes it.",
  },
  {
    id: "02_lead_gen",
    realName: "Marcus Reed",
    designation: "Lead Generation Specialist",
    funnel: "hustle" as const,
    isCaptain: false,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    description:
      "Hunts local, corporate, medical, and event leads — the backyard kind that other hotels miss.",
    capabilities: [
      "prospect list building",
      "Apollo / data enrichment",
      "local market research",
      "segment discovery",
      "lead scoring",
    ],
    solvesProblem:
      "Empty pipeline — Marcus fills it with real, qualified prospects from the hotel's backyard.",
  },
  {
    id: "03_outbound",
    realName: "Sarah Chen",
    designation: "Outbound Sales Manager",
    funnel: "calculated" as const,
    isCaptain: false,
    photo: "https://randomuser.me/api/portraits/women/26.jpg",
    description:
      "Writes cold emails, call scripts, and LinkedIn messages — no-fear outreach that lands meetings.",
    capabilities: [
      "cold email sequences",
      "call scripts",
      "LinkedIn outreach",
      "follow-up cadences",
      "A/B subject lines",
    ],
    solvesProblem:
      "Leads exist but nobody is reaching out — Sarah writes the outreach that gets replies.",
  },
  {
    id: "04_rfp_group",
    realName: "Priya Sharma",
    designation: "Group & RFP Sales Lead",
    funnel: "calculated" as const,
    isCaptain: false,
    photo: "https://randomuser.me/api/portraits/women/67.jpg",
    description:
      "Closes RFPs, qualifies group inquiries, and builds room blocks — the big-revenue closer.",
    capabilities: [
      "RFP response writing",
      "group inquiry qualification",
      "room block proposals",
      "LNR rate structures",
      "concession strategy",
    ],
    solvesProblem:
      "RFPs go unanswered and group leads slip away — Priya closes them with polished proposals.",
  },
  {
    id: "05_retention",
    realName: "Liam Chen",
    designation: "Customer Success & Retention Manager",
    funnel: "hustle" as const,
    isCaptain: false,
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    description:
      "Post-stay follow-up, review requests, win-back campaigns — turns one-time guests into repeat revenue.",
    capabilities: [
      "post-stay sequences",
      "review generation",
      "win-back campaigns",
      "loyalty offers",
      "repeat-stay tracking",
    ],
    solvesProblem:
      "Guests check out and never come back — Liam builds the repeat-stay engine.",
  },
  {
    id: "06_revenue",
    realName: "Maya Reddy",
    designation: "Revenue Analytics Manager",
    funnel: "calculated" as const,
    isCaptain: false,
    photo: "https://randomuser.me/api/portraits/women/11.jpg",
    description:
      "Creates dashboards, weekly leadership reports, and pipeline analytics — proves the revenue to ownership.",
    capabilities: [
      "weekly reports",
      "pipeline dashboards",
      "KPI tracking",
      "segment analysis",
      "revenue forecasting",
    ],
    solvesProblem:
      "Ownership wants proof — Maya builds the reports that show explosive revenue growth.",
  },
] as const;

export type Agent = (typeof AGENTS)[number];
export type AgentId = Agent["id"];
export type Funnel = "calculated" | "hustle";

/** Map from old 11-agent IDs to new 6-agent IDs for backward compat */
export const AGENT_REDIRECTS: Record<string, string> = {
  "00_director_of_sales": "01_director",
  "01_lead_generation": "02_lead_gen",
  "02_outbound_sales": "03_outbound",
  "03_account_manager": "05_retention",
  "04_rfp_closing": "04_rfp_group",
  "05_lnr_closing": "04_rfp_group",
  "06_group_sales": "04_rfp_group",
  "07_meeting_catering": "04_rfp_group",
  "08_after_sales": "05_retention",
  "09_retention": "05_retention",
  "10_revenue_leadership": "06_revenue",
};

export const getAgent = (id: string): Agent | undefined => {
  const direct = AGENTS.find((a) => a.id === id);
  if (direct) return direct;
  const redirected = AGENT_REDIRECTS[id];
  if (redirected) return AGENTS.find((a) => a.id === redirected);
  return undefined;
};

export const resolveAgentId = (id: string): string =>
  AGENT_REDIRECTS[id] ?? id;

export const FUNNELS: Record<
  Funnel,
  {
    label: string;
    tagline: string;
    description: string;
    emoji: string;
    accentClass: string;
  }
> = {
  calculated: {
    label: "Calculated Funnel",
    tagline: "Big Account Hunters",
    description:
      "Direct relationships with the top accounts. Big revenue. Brand-level focus.",
    emoji: "crosshair",
    accentClass: "text-mhsp-navy",
  },
  hustle: {
    label: "Hustle Funnel",
    tagline: "Backyard Grassroots",
    description:
      "First one to convert the local opportunity wins. Medical, sports, construction, weddings, repeat stays - all the backyard revenue most hotels miss.",
    emoji: "zap",
    accentClass: "text-mhsp-teal",
  },
};
