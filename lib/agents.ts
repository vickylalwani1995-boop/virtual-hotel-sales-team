export const AGENTS = [
  { id: "00_director_of_sales", name: "Director of Sales", icon: "🎯", color: "teal", tier: 1, description: "Owns sales strategy, assigns work, prepares reports" },
  { id: "01_lead_generation", name: "Lead Generation Agent", icon: "🔍", color: "green", tier: 1, description: "Finds local, corporate, group, and event leads" },
  { id: "02_outbound_sales", name: "Outbound Sales Agent", icon: "✈️", color: "blue", tier: 1, description: "Writes cold emails, call scripts, LinkedIn messages" },
  { id: "03_account_manager", name: "Account Relationship Manager", icon: "🤝", color: "purple", tier: 2, description: "Manages warm and existing accounts" },
  { id: "04_rfp_closing", name: "RFP Closing Agent", icon: "📄", color: "orange", tier: 2, description: "Reads RFPs, writes value-positioned responses" },
  { id: "05_lnr_closing", name: "LNR Closing Agent", icon: "💼", color: "amber", tier: 2, description: "Handles Local Negotiated Rate opportunities" },
  { id: "06_group_sales", name: "Group Sales Agent", icon: "👥", color: "indigo", tier: 2, description: "Qualifies group inquiries and room blocks" },
  { id: "07_meeting_catering", name: "Meeting & Catering Agent", icon: "🍽️", color: "pink", tier: 2, description: "Qualifies meeting and catering inquiries" },
  { id: "08_after_sales", name: "After-Sales Service Agent", icon: "💝", color: "red", tier: 1, description: "Sends post-stay follow-up and review requests" },
  { id: "09_retention", name: "Customer Revenue & Retention Agent", icon: "🔄", color: "emerald", tier: 1, description: "Finds repeat-booking opportunities and win-backs" },
  { id: "10_revenue_leadership", name: "Revenue & Leadership Agent", icon: "📊", color: "violet", tier: 1, description: "Creates dashboards and weekly leadership reports" }
] as const;

export type Agent = typeof AGENTS[number];
export const getAgent = (id: string): Agent | undefined =>
  AGENTS.find((a) => a.id === id);
