import {
  Target,
  Search,
  Send,
  Handshake,
  FileText,
  Briefcase,
  Users,
  Utensils,
  HeartHandshake,
  RefreshCw,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export const AGENT_ICONS: Record<string, LucideIcon> = {
  "00_director_of_sales": Target,
  "01_lead_generation": Search,
  "02_outbound_sales": Send,
  "03_account_manager": Handshake,
  "04_rfp_closing": FileText,
  "05_lnr_closing": Briefcase,
  "06_group_sales": Users,
  "07_meeting_catering": Utensils,
  "08_after_sales": HeartHandshake,
  "09_retention": RefreshCw,
  "10_revenue_leadership": BarChart3,
};

export function iconForAgent(id: string): LucideIcon {
  return AGENT_ICONS[id] ?? Target;
}
