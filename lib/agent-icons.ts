import {
  Crown,
  Search,
  Send,
  Users,
  FileText,
  Anchor,
  Building2,
  Utensils,
  Gift,
  RefreshCw,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export const AGENT_ICONS: Record<string, LucideIcon> = {
  "00_director_of_sales": Crown,
  "01_lead_generation": Search,
  "02_outbound_sales": Send,
  "03_account_manager": Users,
  "04_rfp_closing": FileText,
  "05_lnr_closing": Anchor,
  "06_group_sales": Building2,
  "07_meeting_catering": Utensils,
  "08_after_sales": Gift,
  "09_retention": RefreshCw,
  "10_revenue_leadership": BarChart3,
};

export function iconForAgent(id: string): LucideIcon {
  return AGENT_ICONS[id] ?? Crown;
}
