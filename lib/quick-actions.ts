export const QUICK_ACTIONS: Record<string, string[]> = {
  "00_director_of_sales": [
    "Plan our week",
    "Where should we focus?",
    "What's our biggest gap?",
    "Weekly priorities",
  ],
  "01_lead_generation": [
    "10 corporate leads in Dallas",
    "Medical center contacts",
    "Long-stay project teams",
    "Local universities",
  ],
  "02_outbound_sales": [
    "Cold email — corporate tone",
    "Follow-up sequence",
    "LinkedIn message",
    "Re-engage cold lead",
  ],
  "03_account_manager": [
    "Top 10 warm accounts",
    "QBR talking points",
    "Renewal at-risk list",
    "Account health check",
  ],
  "04_rfp_closing": [
    "Strong opening paragraph",
    "Pricing strategy section",
    "Differentiation pitch",
    "Compliance checklist",
  ],
  "05_lnr_closing": [
    "Annual rate proposal",
    "Justify rate increase",
    "Competitor comparison",
    "Contract follow-up",
  ],
  "06_group_sales": [
    "Qualify a group inquiry",
    "Room block proposal",
    "Concession strategy",
    "Cutoff date logic",
  ],
  "07_meeting_catering": [
    "Wedding package proposal",
    "Corporate retreat menu",
    "Banquet event upsell",
    "Planner follow-up",
  ],
  "08_after_sales": [
    "Thank-you message",
    "Review request",
    "Referral request",
    "Service recovery",
  ],
  "09_retention": [
    "Win-back campaign",
    "Repeat-stay offer",
    "Lapsed account list",
    "Loyalty incentive",
  ],
  "10_revenue_leadership": [
    "Weekly revenue summary",
    "Pipeline health report",
    "Productivity metrics",
    "Owner update",
  ],
};

export function quickActionsFor(agentId: string): string[] {
  return QUICK_ACTIONS[agentId] ?? [];
}
