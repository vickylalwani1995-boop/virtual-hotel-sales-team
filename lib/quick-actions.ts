export const QUICK_ACTIONS: Record<string, string[]> = {
  "01_director": [
    "Plan our week",
    "Where should we focus?",
    "What's our biggest gap?",
    "Weekly priorities",
  ],
  "02_lead_gen": [
    "10 corporate leads in Dallas",
    "Medical center contacts",
    "Long-stay project teams",
    "Local universities",
  ],
  "03_outbound": [
    "Cold email - corporate tone",
    "Follow-up sequence",
    "LinkedIn message",
    "Re-engage cold lead",
  ],
  "04_rfp_group": [
    "Strong RFP opening paragraph",
    "Room block proposal",
    "LNR rate structure",
    "Group concession strategy",
  ],
  "05_retention": [
    "Thank-you message",
    "Win-back campaign",
    "Repeat-stay offer",
    "Review request",
  ],
  "06_revenue": [
    "Weekly revenue summary",
    "Pipeline health report",
    "Productivity metrics",
    "Owner update",
  ],
};

export function quickActionsFor(agentId: string): string[] {
  return QUICK_ACTIONS[agentId] ?? [];
}
