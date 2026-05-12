import { nanoid } from "nanoid";

const KEY = "vhst-workspace";
const MAX_LEADS = 500;
const MAX_EMAILS = 200;
const MAX_ACTIVITY = 50;
const MAX_FILES = 10;

export interface WorkspaceLead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  source: "apollo" | "vibe" | "agent" | "manual" | "uploaded";
  addedBy: string;
  addedAt: string;
  funnel: "calculated" | "hustle";
  status: "new" | "contacted" | "replied" | "qualified" | "closed";
  notes: string;
}

export interface WorkspaceEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  draftedBy: string;
  draftedAt: string;
  leadId?: string;
  status: "draft" | "queued" | "sent";
}

export interface WorkspaceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: string;
  uploadedInAgent: string;
  description: string;
}

export interface WorkspaceActivity {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  timestamp: string;
}

export interface WorkspaceState {
  leads: WorkspaceLead[];
  emails: WorkspaceEmail[];
  files: WorkspaceFile[];
  activityLog: WorkspaceActivity[];
  currentFocus: string;
  lastUpdated: string;
}

const DEFAULT_WS: WorkspaceState = {
  leads: [],
  emails: [],
  files: [],
  activityLog: [],
  currentFocus: "",
  lastUpdated: "",
};

// ─── Core storage ─────────────────────────────────────────────────────────────

export function getWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return { ...DEFAULT_WS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_WS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_WS, ...parsed };
  } catch {
    return { ...DEFAULT_WS };
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ ...state, lastUpdated: new Date().toISOString() })
  );
  window.dispatchEvent(new CustomEvent("vhst-workspace-changed"));
}

export function resetWorkspace(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("vhst-workspace-changed"));
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function addLeads(
  leads: Omit<WorkspaceLead, "id" | "addedAt">[],
  addedBy: string
): void {
  const ws = getWorkspace();
  const stamped: WorkspaceLead[] = leads.map((l) => ({
    ...l,
    id: nanoid(8),
    addedAt: new Date().toISOString(),
    addedBy,
  }));
  saveWorkspace({ ...ws, leads: [...stamped, ...ws.leads].slice(0, MAX_LEADS) });
}

export function getAllLeads(): WorkspaceLead[] {
  return getWorkspace().leads;
}

export function getRecentLeads(limit = 10): WorkspaceLead[] {
  return getWorkspace().leads.slice(0, limit);
}

// ─── Emails ───────────────────────────────────────────────────────────────────

export function addEmail(
  email: Omit<WorkspaceEmail, "id" | "draftedAt">,
  draftedBy: string
): void {
  const ws = getWorkspace();
  const full: WorkspaceEmail = {
    ...email,
    id: nanoid(8),
    draftedBy,
    draftedAt: new Date().toISOString(),
  };
  saveWorkspace({ ...ws, emails: [full, ...ws.emails].slice(0, MAX_EMAILS) });
}

export function getRecentEmails(limit = 10): WorkspaceEmail[] {
  return getWorkspace().emails.slice(0, limit);
}

// ─── Files ────────────────────────────────────────────────────────────────────

export function addFile(file: Omit<WorkspaceFile, "id" | "uploadedAt">): void {
  const ws = getWorkspace();
  const full: WorkspaceFile = {
    ...file,
    id: nanoid(8),
    uploadedAt: new Date().toISOString(),
  };
  saveWorkspace({ ...ws, files: [full, ...ws.files].slice(0, MAX_FILES) });
}

export function getFiles(): WorkspaceFile[] {
  return getWorkspace().files;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export function logWorkspaceActivity(
  agentId: string,
  agentName: string,
  action: string
): void {
  const ws = getWorkspace();
  const entry: WorkspaceActivity = {
    id: nanoid(8),
    agentId,
    agentName,
    action,
    timestamp: new Date().toISOString(),
  };
  saveWorkspace({
    ...ws,
    activityLog: [entry, ...ws.activityLog].slice(0, MAX_ACTIVITY),
  });
}

export function getRecentActivity(limit = 10): WorkspaceActivity[] {
  return getWorkspace().activityLog.slice(0, limit);
}

// ─── Team briefing (injected into every agent's system prompt) ────────────────

export function generateTeamBriefing(currentAgentId: string): string {
  const ws = getWorkspace();
  const lines: string[] = ["## Shared Team Workspace", ""];

  const { leads } = ws;
  if (leads.length > 0) {
    const byAgent: Record<string, number> = {};
    leads.forEach((l) => {
      byAgent[l.addedBy] = (byAgent[l.addedBy] ?? 0) + 1;
    });
    const breakdown = Object.entries(byAgent)
      .map(([n, c]) => `${c} by ${n}`)
      .join(", ");
    lines.push(`**Leads in workspace:** ${leads.length} (${breakdown})`);
    leads.slice(0, 5).forEach((l) => {
      lines.push(
        `  • ${l.name} · ${l.title} · ${l.company}${l.industry ? ` (${l.industry})` : ""} · status: ${l.status}`
      );
    });
    if (leads.length > 5) lines.push(`  … and ${leads.length - 5} more`);
  } else {
    lines.push("**Leads in workspace:** None yet.");
  }
  lines.push("");

  const { emails } = ws;
  if (emails.length > 0) {
    lines.push(`**Emails drafted:** ${emails.length}`);
    emails.slice(0, 3).forEach((e) => {
      lines.push(
        `  • To: ${e.to} · "${e.subject}" · by ${e.draftedBy} · ${e.status}`
      );
    });
  } else {
    lines.push("**Emails drafted:** None yet.");
  }
  lines.push("");

  if (ws.files.length > 0) {
    lines.push(`**Files uploaded:** ${ws.files.length}`);
    ws.files.forEach((f) => lines.push(`  • ${f.name}: ${f.description}`));
    lines.push("");
  }

  const othersActivity = ws.activityLog
    .filter((a) => a.agentId !== currentAgentId)
    .slice(0, 6);
  if (othersActivity.length > 0) {
    lines.push("**Teammate activity:**");
    othersActivity.forEach((a) => {
      lines.push(`  • ${a.agentName}: ${a.action} (${relTime(a.timestamp)})`);
    });
    lines.push("");
  }

  if (ws.currentFocus) {
    lines.push(`**Team focus:** ${ws.currentFocus}`);
    lines.push("");
  }

  const hasData =
    leads.length > 0 ||
    emails.length > 0 ||
    ws.files.length > 0 ||
    othersActivity.length > 0;

  if (!hasData) {
    return "Workspace is fresh — you are the first agent active this session. Complete tasks to populate the shared workspace for your teammates.";
  }

  return lines.join("\n");
}

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

// ─── Demo workspace seed ──────────────────────────────────────────────────────

const $now = Date.now();

const DEMO_LEADS: WorkspaceLead[] = [
  { id: "dl01", name: "Dr. James Whitfield", title: "Chief of Surgery", company: "Texas Health Resources", email: "j.whitfield@txhealth.org", industry: "Healthcare", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 7200000).toISOString(), funnel: "hustle", status: "new", notes: "Key decision maker for travel block" },
  { id: "dl02", name: "Sarah Martinez", title: "VP of Procurement", company: "UT Southwestern", email: "s.martinez@utsw.edu", industry: "Healthcare", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 7200000).toISOString(), funnel: "hustle", status: "new", notes: "Controls travel vendor approvals" },
  { id: "dl03", name: "Mike Torres", title: "Project Director", company: "Kimberly-Clark", email: "m.torres@kcc.com", industry: "Construction", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 7200000).toISOString(), funnel: "hustle", status: "new", notes: "18-month Dallas expansion project" },
  { id: "dl04", name: "Lisa Chen", title: "Corporate Travel Manager", company: "AT&T", email: "l.chen@att.com", industry: "Technology", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 5400000).toISOString(), funnel: "calculated", status: "new", notes: "500+ room nights per year" },
  { id: "dl05", name: "Robert Kim", title: "Director of Meetings & Events", company: "Baylor Scott & White Health", email: "r.kim@bswhealth.com", industry: "Healthcare", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 5400000).toISOString(), funnel: "hustle", status: "new", notes: "Quarterly conference organizer" },
  { id: "dl06", name: "Jennifer Walsh", title: "VP Sales Operations", company: "Toyota Financial Services", email: "j.walsh@toyota.com", industry: "Finance", source: "vibe", addedBy: "Marcus Reed", addedAt: new Date($now - 5400000).toISOString(), funnel: "calculated", status: "new", notes: "Based in Plano, needs Dallas hotel" },
  { id: "dl07", name: "David Park", title: "Construction Manager", company: "Hunt Companies", email: "d.park@huntcompanies.com", industry: "Construction", source: "vibe", addedBy: "Marcus Reed", addedAt: new Date($now - 3600000).toISOString(), funnel: "hustle", status: "new", notes: "2-year project crew near property" },
  { id: "dl08", name: "Amanda Ross", title: "Regional HR Director", company: "Lockheed Martin", email: "a.ross@lmco.com", industry: "Defense", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 3600000).toISOString(), funnel: "calculated", status: "new", notes: "Relocating talent to DFW" },
  { id: "dl09", name: "Carlos Mendoza", title: "Athletic Director", company: "SMU Athletics", email: "c.mendoza@smu.edu", industry: "Sports", source: "agent", addedBy: "Marcus Reed", addedAt: new Date($now - 3600000).toISOString(), funnel: "hustle", status: "new", notes: "Visiting teams travel coordinator" },
  { id: "dl10", name: "Patricia Hughes", title: "Office Manager", company: "Neiman Marcus Group", email: "p.hughes@neimanmarcus.com", industry: "Retail", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 1800000).toISOString(), funnel: "hustle", status: "new", notes: "Buyer events quarterly" },
];

const DEMO_EMAILS: WorkspaceEmail[] = [
  { id: "de01", to: "j.whitfield@txhealth.org", subject: "Room Block Proposal — Texas Health × Westmore Partnership", body: "Dr. Whitfield, your surgical teams work long shifts and deserve a hotel that feels like home...", draftedBy: "Sarah Chen", draftedAt: new Date($now - 3600000).toISOString(), leadId: "dl01", status: "draft" },
  { id: "de02", to: "s.martinez@utsw.edu", subject: "Preferred Vendor Proposal — UT Southwestern × Westmore", body: "Sarah, UT Southwestern books 1,200+ room nights annually in DFW...", draftedBy: "Sarah Chen", draftedAt: new Date($now - 3600000).toISOString(), leadId: "dl02", status: "draft" },
  { id: "de03", to: "m.torres@kcc.com", subject: "Extended-Stay Rate — Construction Crew Block at Westmore", body: "Mike, long-term construction projects need reliable lodging close to the site...", draftedBy: "Sarah Chen", draftedAt: new Date($now - 2700000).toISOString(), leadId: "dl03", status: "queued" },
];

const DEMO_ACTIVITY: WorkspaceActivity[] = [
  { id: "da01", agentId: "01_lead_generation", agentName: "Marcus Reed", action: "found 10 medical + healthcare leads via Apollo in Dallas", timestamp: new Date($now - 7200000).toISOString() },
  { id: "da02", agentId: "01_lead_generation", agentName: "Marcus Reed", action: "added 5 corporate leads (construction, defense, finance)", timestamp: new Date($now - 5400000).toISOString() },
  { id: "da03", agentId: "02_outbound_sales", agentName: "Sarah Chen", action: "drafted 3 personalized cold emails for top medical leads", timestamp: new Date($now - 3600000).toISOString() },
  { id: "da04", agentId: "00_director_of_sales", agentName: "Donna Marie", action: "generated weekly plan focused on Sun–Tue corporate occupancy", timestamp: new Date($now - 1800000).toISOString() },
];

export function seedDemoWorkspace(): void {
  const ws = getWorkspace();
  if (ws.leads.length > 0) return;
  saveWorkspace({
    currentFocus: "Weekday corporate occupancy (Sun–Tue)",
    lastUpdated: new Date().toISOString(),
    leads: DEMO_LEADS,
    emails: DEMO_EMAILS,
    files: [],
    activityLog: DEMO_ACTIVITY,
  });
}
