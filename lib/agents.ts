export const AGENTS = [
  {
    id: "00_director_of_sales",
    name: "Director of Sales",
    roleTitle: "The Funnel Captain",
    icon: "🎯",
    color: "teal",
    tier: 1,
    funnel: "calculated",
    description: "Owns sales strategy, assigns work, prepares reports",
  },
  {
    id: "01_lead_generation",
    name: "Backyard Lead Hunter",
    roleTitle: "The Backyard Hunter",
    icon: "🔍",
    color: "green",
    tier: 1,
    funnel: "hustle",
    description: "Hunts local, corporate, group, medical, and event leads - the backyard kind that other hotels miss",
  },
  {
    id: "02_outbound_sales",
    name: "Outbound Sales Agent",
    roleTitle: "The No-Fear Closer",
    icon: "✈️",
    color: "blue",
    tier: 1,
    funnel: "calculated",
    description: "Writes cold emails, call scripts, LinkedIn messages - no-fear outreach to the top of the funnel",
  },
  {
    id: "03_account_manager",
    name: "Account Relationship Manager",
    roleTitle: "The Top Account Steward",
    icon: "🤝",
    color: "purple",
    tier: 2,
    funnel: "calculated",
    description: "Manages warm and existing top accounts - protects the big revenue you already have",
  },
  {
    id: "04_rfp_closing",
    name: "RFP Closing Agent",
    roleTitle: "The Big Revenue Closer",
    icon: "📄",
    color: "orange",
    tier: 2,
    funnel: "calculated",
    description: "Reads RFPs, writes value-positioned responses that win brand-level corporate business",
  },
  {
    id: "05_lnr_closing",
    name: "LNR Closing Agent",
    roleTitle: "The Corporate Anchor",
    icon: "💼",
    color: "amber",
    tier: 2,
    funnel: "calculated",
    description: "Handles Local Negotiated Rate opportunities - anchors the calendar with predictable corporate volume",
  },
  {
    id: "06_group_sales",
    name: "Group Sales Agent",
    roleTitle: "The Block Builder",
    icon: "👥",
    color: "indigo",
    tier: 2,
    funnel: "hustle",
    description: "Qualifies group inquiries and builds room blocks for community events and association meetings",
  },
  {
    id: "07_meeting_catering",
    name: "Meeting & Catering Agent",
    roleTitle: "The Event Hustler",
    icon: "🍽️",
    color: "pink",
    tier: 2,
    funnel: "hustle",
    description: "Qualifies meeting and catering inquiries - pitches the F&B opportunity local hotels usually miss",
  },
  {
    id: "08_after_sales",
    name: "After-Sales Service Agent",
    roleTitle: "The Repeat Magnet",
    icon: "💝",
    color: "red",
    tier: 1,
    funnel: "hustle",
    description: "Sends post-stay follow-up and review requests - turns one-time guests into repeat backyard revenue",
  },
  {
    id: "09_retention",
    name: "Customer Revenue & Retention Agent",
    roleTitle: "The Win-Back Specialist",
    icon: "🔄",
    color: "emerald",
    tier: 1,
    funnel: "hustle",
    description: "Finds repeat-booking opportunities and wins back lapsed local accounts before competitors get them",
  },
  {
    id: "10_revenue_leadership",
    name: "Revenue & Leadership Agent",
    roleTitle: "The Revenue Reporter",
    icon: "📊",
    color: "violet",
    tier: 1,
    funnel: "calculated",
    description: "Creates dashboards and weekly leadership reports - proves the explosive revenue to ownership",
  },
] as const;

export type Agent = typeof AGENTS[number];
export type Funnel = "calculated" | "hustle";

export const getAgent = (id: string): Agent | undefined =>
  AGENTS.find((a) => a.id === id);

export const FUNNELS: Record<
  Funnel,
  { label: string; tagline: string; description: string; emoji: string; accentClass: string }
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
