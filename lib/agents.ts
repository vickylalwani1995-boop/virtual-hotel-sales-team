export const AGENTS = [
  {
    id: "00_director_of_sales",
    realName: "Donna Marie",
    jobTitle: "Director of Sales",
    mhspRole: "The Funnel Captain",
    // backward-compat fields used by agents page and home page constellation
    name: "Director of Sales",
    roleTitle: "The Funnel Captain",
    icon: "🎯",
    color: "teal",
    tier: 1,
    funnel: "calculated",
    isCaptain: true,
    description:
      "Owns sales strategy. Briefs every agent. Reports to ownership.",
  },
  {
    id: "01_lead_generation",
    realName: "Marcus Reed",
    jobTitle: "Lead Generation",
    mhspRole: "The Backyard Hunter",
    name: "Backyard Lead Hunter",
    roleTitle: "The Backyard Hunter",
    icon: "🔍",
    color: "green",
    tier: 1,
    funnel: "hustle",
    isCaptain: false,
    description:
      "Hunts local, corporate, group, medical, and event leads — the backyard kind that other hotels miss.",
  },
  {
    id: "02_outbound_sales",
    realName: "Sarah Chen",
    jobTitle: "Outbound Sales",
    mhspRole: "The No-Fear Closer",
    name: "Outbound Sales Agent",
    roleTitle: "The No-Fear Closer",
    icon: "✈️",
    color: "blue",
    tier: 1,
    funnel: "calculated",
    isCaptain: false,
    description:
      "Writes cold emails, call scripts, and LinkedIn messages — no-fear outreach that lands meetings.",
  },
  {
    id: "03_account_manager",
    realName: "James Walsh",
    jobTitle: "Account Relationship Manager",
    mhspRole: "The Top Account Steward",
    name: "Account Relationship Manager",
    roleTitle: "The Top Account Steward",
    icon: "🤝",
    color: "purple",
    tier: 2,
    funnel: "calculated",
    isCaptain: false,
    description:
      "Protects the big revenue you already have. Keeps top accounts warm and renewing.",
  },
  {
    id: "04_rfp_closing",
    realName: "Priya Sharma",
    jobTitle: "RFP Closing",
    mhspRole: "The Big Revenue Closer",
    name: "RFP Closing Agent",
    roleTitle: "The Big Revenue Closer",
    icon: "📄",
    color: "orange",
    tier: 2,
    funnel: "calculated",
    isCaptain: false,
    description:
      "Reads RFPs in seconds. Writes brand-level corporate responses that win.",
  },
  {
    id: "05_lnr_closing",
    realName: "Tom Walker",
    jobTitle: "LNR Closing",
    mhspRole: "The Corporate Anchor",
    name: "LNR Closing Agent",
    roleTitle: "The Corporate Anchor",
    icon: "💼",
    color: "amber",
    tier: 2,
    funnel: "calculated",
    isCaptain: false,
    description:
      "Handles Local Negotiated Rates. Anchors your calendar with predictable corporate volume.",
  },
  {
    id: "06_group_sales",
    realName: "Alex Brooks",
    jobTitle: "Group Sales",
    mhspRole: "The Block Builder",
    name: "Group Sales Agent",
    roleTitle: "The Block Builder",
    icon: "👥",
    color: "indigo",
    tier: 2,
    funnel: "hustle",
    isCaptain: false,
    description:
      "Qualifies group inquiries. Builds room blocks for community events and associations.",
  },
  {
    id: "07_meeting_catering",
    realName: "Sophie Lin",
    jobTitle: "Meeting & Catering",
    mhspRole: "The Event Hustler",
    name: "Meeting & Catering Agent",
    roleTitle: "The Event Hustler",
    icon: "🍽️",
    color: "pink",
    tier: 2,
    funnel: "hustle",
    isCaptain: false,
    description:
      "Qualifies meeting + catering inquiries. Pitches the F&B opportunity local hotels miss.",
  },
  {
    id: "08_after_sales",
    realName: "Liam Chen",
    jobTitle: "After-Sales Service",
    mhspRole: "The Repeat Magnet",
    name: "After-Sales Service Agent",
    roleTitle: "The Repeat Magnet",
    icon: "💝",
    color: "red",
    tier: 1,
    funnel: "hustle",
    isCaptain: false,
    description:
      "Sends post-stay follow-up and review requests — turns one-time guests into repeat backyard revenue.",
  },
  {
    id: "09_retention",
    realName: "Nina Patel",
    jobTitle: "Customer Revenue & Retention",
    mhspRole: "The Win-Back Specialist",
    name: "Customer Revenue & Retention Agent",
    roleTitle: "The Win-Back Specialist",
    icon: "🔄",
    color: "emerald",
    tier: 1,
    funnel: "hustle",
    isCaptain: false,
    description:
      "Finds repeat-booking opportunities. Wins back lapsed local accounts before competitors do.",
  },
  {
    id: "10_revenue_leadership",
    realName: "Maya Reddy",
    jobTitle: "Revenue & Leadership",
    mhspRole: "The Revenue Reporter",
    name: "Revenue & Leadership Agent",
    roleTitle: "The Revenue Reporter",
    icon: "📊",
    color: "violet",
    tier: 1,
    funnel: "calculated",
    isCaptain: false,
    description:
      "Creates dashboards and weekly leadership reports. Proves the explosive revenue to ownership.",
  },
] as const;

export type Agent = (typeof AGENTS)[number];
export type Funnel = "calculated" | "hustle";

export const getAgent = (id: string): Agent | undefined =>
  AGENTS.find((a) => a.id === id);

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
    emoji: "🎯",
    accentClass: "text-mhsp-navy",
  },
  hustle: {
    label: "Hustle Funnel",
    tagline: "Backyard Grassroots",
    description:
      "First one to convert the local opportunity wins. Medical, sports, construction, weddings, repeat stays - all the backyard revenue most hotels miss.",
    emoji: "⚡",
    accentClass: "text-mhsp-teal",
  },
};
