import {
  Crown,
  Search,
  Send,
  FileText,
  Heart,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export const AGENT_ICONS: Record<string, LucideIcon> = {
  "01_director": Crown,
  "02_lead_gen": Search,
  "03_outbound": Send,
  "04_rfp_group": FileText,
  "05_retention": Heart,
  "06_revenue": BarChart3,
};

export function iconForAgent(id: string): LucideIcon {
  return AGENT_ICONS[id] ?? Crown;
}
