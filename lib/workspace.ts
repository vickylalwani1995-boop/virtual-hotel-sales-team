import { nanoid } from "nanoid";

const KEY = "vhst-workspace";
const MAX_LEADS = 500;
const MAX_EMAILS = 200;
const MAX_SEQUENCES = 50;
const MAX_CALLS = 200;
const MAX_FILES = 10;
const MAX_ACTIVITY = 100;

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface HotelProfile {
  name: string;
  location: string;
  rooms: number;
  adr: number;
  occupancy: number;
  weakDays: string;
  targetBusiness: string[];
  meetingSpace: boolean;
  brand: string;
}

export interface WorkspaceLead {
  id: string;
  rowNum: number;
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string;
  jobSeniority: string;
  jobDepartment: string;
  linkedin: string;
  companyName: string;
  companyWebsite: string;
  companyLinkedin: string;
  city: string;
  region: string;
  country: string;
  email: string;
  emailStatus: "verified" | "guessed" | "unverified";
  additionalEmails: string[];
  mobilePhone: string;
  additionalPhones: string[];
  experience: string;
  skills: string[];
  interests: string[];
  source: "apollo" | "vibe" | "agent" | "manual" | "uploaded";
  addedBy: string;
  addedAt: string;
  funnel: "calculated" | "hustle";
  status: "new" | "contacted" | "replied" | "qualified" | "closed";
  notes: string;
  industry: string;
  callStatus: "not_called" | "queued" | "completed" | "no_answer" | "voicemail";
  emailCampaignStatus: "not_emailed" | "queued" | "sent" | "opened" | "replied";
}

export interface WorkspaceEmail {
  id: string;
  leadId?: string;
  to: string;
  subject: string;
  body: string;
  draftedBy: string;
  draftedAt: string;
  status: "draft" | "queued" | "sent" | "opened" | "replied" | "bounced";
  sentAt?: string;
  openedAt?: string;
}

export interface SequenceStep {
  day: number;
  subject: string;
  body: string;
  type: "email" | "call" | "linkedin";
}

export interface WorkspaceSequence {
  id: string;
  name: string;
  recipientLeadIds: string[];
  steps: SequenceStep[];
  scheduledBy: string;
  scheduledAt: string;
  status: "scheduled" | "active" | "paused" | "complete";
  nextSendDate?: string;
  platform: string;
}

export interface WorkspaceCall {
  id: string;
  leadId: string;
  leadName: string;
  leadCompany: string;
  scheduledBy: string;
  scheduledAt: string;
  scheduledFor: string;
  duration?: number;
  transcript?: string;
  outcome?: "connected" | "voicemail" | "no_answer" | "wrong_number";
  notes?: string;
  status: "queued" | "in_progress" | "completed";
}

export interface WorkspaceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  summary: string;
  uploadedAt: string;
  uploadedInAgent: string;
  detectedType?: "leads" | "rfp" | "rate_sheet" | "contract" | "market_data" | "other";
}

export interface WorkspaceActivity {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceState {
  hotelProfile: HotelProfile | null;
  leads: WorkspaceLead[];
  emails: WorkspaceEmail[];
  sequences: WorkspaceSequence[];
  calls: WorkspaceCall[];
  files: WorkspaceFile[];
  activityLog: WorkspaceActivity[];
  currentFocus: string;
  lastUpdated: string;
}

const DEFAULT_WS: WorkspaceState = {
  hotelProfile: null,
  leads: [],
  emails: [],
  sequences: [],
  calls: [],
  files: [],
  activityLog: [],
  currentFocus: "",
  lastUpdated: "",
};

// ─── Backward-compat normalizers ──────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Normalize a lead from old (name/title/company) or new shape into WorkspaceLead */
function normalizeLead(raw: any, addedBy: string): WorkspaceLead {
  const now = new Date().toISOString();
  const fullName = raw.fullName || raw.name || "";
  const [firstName, ...rest] = fullName.split(" ");
  return {
    id: raw.id || nanoid(8),
    rowNum: raw.rowNum ?? 0,
    firstName: raw.firstName || firstName || "",
    lastName: raw.lastName || rest.join(" ") || "",
    fullName,
    jobTitle: raw.jobTitle || raw.title || "",
    jobSeniority: raw.jobSeniority || "",
    jobDepartment: raw.jobDepartment || "",
    linkedin: raw.linkedin || "",
    companyName: raw.companyName || raw.company || "",
    companyWebsite: raw.companyWebsite || "",
    companyLinkedin: raw.companyLinkedin || "",
    city: raw.city || "",
    region: raw.region || "",
    country: raw.country || "",
    email: raw.email || "",
    emailStatus: raw.emailStatus || "unverified",
    additionalEmails: raw.additionalEmails || [],
    mobilePhone: raw.mobilePhone || raw.phone || "",
    additionalPhones: raw.additionalPhones || [],
    experience: raw.experience || "",
    skills: raw.skills || [],
    interests: raw.interests || [],
    source: raw.source || "manual",
    addedBy: raw.addedBy || addedBy,
    addedAt: raw.addedAt || now,
    funnel: raw.funnel || "hustle",
    status: raw.status || "new",
    notes: raw.notes || "",
    industry: raw.industry || "",
    callStatus: raw.callStatus || "not_called",
    emailCampaignStatus: raw.emailCampaignStatus || "not_emailed",
  };
}

/** Normalize an old WorkspaceFile (description → summary) */
function normalizeFile(raw: any): WorkspaceFile {
  return {
    id: raw.id || nanoid(8),
    name: raw.name || "",
    type: raw.type || "",
    size: raw.size || 0,
    content: raw.content || "",
    summary: raw.summary || raw.description || "",
    uploadedAt: raw.uploadedAt || new Date().toISOString(),
    uploadedInAgent: raw.uploadedInAgent || "",
    detectedType: raw.detectedType,
  };
}

/** Normalize an old WorkspaceActivity (add summary field) */
function normalizeActivity(raw: any): WorkspaceActivity {
  return {
    id: raw.id || nanoid(8),
    agentId: raw.agentId || "",
    agentName: raw.agentName || "",
    action: raw.action || "",
    summary: raw.summary || raw.action || "",
    timestamp: raw.timestamp || new Date().toISOString(),
    metadata: raw.metadata,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Core storage ─────────────────────────────────────────────────────────────

export function getWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return { ...DEFAULT_WS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_WS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_WS,
      ...parsed,
      // Ensure new array fields exist even for old persisted data
      sequences: parsed.sequences ?? [],
      calls: parsed.calls ?? [],
      hotelProfile: parsed.hotelProfile ?? null,
      // Normalize old data shapes
      leads: (parsed.leads ?? []).map((l: Record<string, unknown>) => normalizeLead(l, "")),
      files: (parsed.files ?? []).map(normalizeFile),
      activityLog: (parsed.activityLog ?? []).map(normalizeActivity),
    };
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

// ─── Hotel Profile ────────────────────────────────────────────────────────────

export function setHotelProfile(profile: HotelProfile): void {
  const ws = getWorkspace();
  saveWorkspace({ ...ws, hotelProfile: profile });
}

export function getHotelProfile(): HotelProfile | null {
  return getWorkspace().hotelProfile;
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function addLeads(
  leads: Partial<WorkspaceLead>[],
  addedBy: string
): WorkspaceLead[] {
  const ws = getWorkspace();
  const stamped: WorkspaceLead[] = leads.map((l) =>
    normalizeLead({ ...l, id: nanoid(8), addedAt: new Date().toISOString() }, addedBy)
  );
  saveWorkspace({ ...ws, leads: [...stamped, ...ws.leads].slice(0, MAX_LEADS) });
  return stamped;
}

export function getAllLeads(): WorkspaceLead[] {
  return getWorkspace().leads;
}

export function getRecentLeads(limit = 10): WorkspaceLead[] {
  return getWorkspace().leads.slice(0, limit);
}

export function updateLead(id: string, updates: Partial<WorkspaceLead>): void {
  const ws = getWorkspace();
  saveWorkspace({
    ...ws,
    leads: ws.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
  });
}

export function deleteLead(id: string): void {
  const ws = getWorkspace();
  saveWorkspace({ ...ws, leads: ws.leads.filter((l) => l.id !== id) });
}

export function getLeadsByFunnel(funnel: WorkspaceLead["funnel"]): WorkspaceLead[] {
  return getWorkspace().leads.filter((l) => l.funnel === funnel);
}

export function getLeadsByStatus(status: WorkspaceLead["status"]): WorkspaceLead[] {
  return getWorkspace().leads.filter((l) => l.status === status);
}

export function getLeadById(id: string): WorkspaceLead | undefined {
  return getWorkspace().leads.find((l) => l.id === id);
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

export function updateEmailStatus(
  id: string,
  status: WorkspaceEmail["status"]
): void {
  const ws = getWorkspace();
  const now = new Date().toISOString();
  saveWorkspace({
    ...ws,
    emails: ws.emails.map((e) => {
      if (e.id !== id) return e;
      const patch: Partial<WorkspaceEmail> = { status };
      if (status === "sent") patch.sentAt = now;
      if (status === "opened") patch.openedAt = now;
      return { ...e, ...patch };
    }),
  });
}

export function getEmailsByLead(leadId: string): WorkspaceEmail[] {
  return getWorkspace().emails.filter((e) => e.leadId === leadId);
}

export function getRecentEmails(limit = 10): WorkspaceEmail[] {
  return getWorkspace().emails.slice(0, limit);
}

// ─── Sequences ────────────────────────────────────────────────────────────────

export function addSequence(
  seq: Omit<WorkspaceSequence, "id" | "scheduledAt" | "scheduledBy">,
  scheduledBy: string
): void {
  const ws = getWorkspace();
  const full: WorkspaceSequence = {
    ...seq,
    id: nanoid(8),
    scheduledBy,
    scheduledAt: new Date().toISOString(),
  };
  saveWorkspace({
    ...ws,
    sequences: [full, ...ws.sequences].slice(0, MAX_SEQUENCES),
  });
}

export function getActiveSequences(): WorkspaceSequence[] {
  return getWorkspace().sequences.filter(
    (s) => s.status === "active" || s.status === "scheduled"
  );
}

export function updateSequence(
  id: string,
  updates: Partial<WorkspaceSequence>
): void {
  const ws = getWorkspace();
  saveWorkspace({
    ...ws,
    sequences: ws.sequences.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    ),
  });
}

// ─── Calls ────────────────────────────────────────────────────────────────────

export function addCall(
  call: Omit<WorkspaceCall, "id" | "scheduledAt">,
  scheduledBy: string
): void {
  const ws = getWorkspace();
  const full: WorkspaceCall = {
    ...call,
    id: nanoid(8),
    scheduledBy,
    scheduledAt: new Date().toISOString(),
  };
  saveWorkspace({ ...ws, calls: [full, ...ws.calls].slice(0, MAX_CALLS) });
}

export function updateCall(id: string, updates: Partial<WorkspaceCall>): void {
  const ws = getWorkspace();
  saveWorkspace({
    ...ws,
    calls: ws.calls.map((c) => (c.id === id ? { ...c, ...updates } : c)),
  });
}

export function getCallsByLead(leadId: string): WorkspaceCall[] {
  return getWorkspace().calls.filter((c) => c.leadId === leadId);
}

// ─── Files ────────────────────────────────────────────────────────────────────

export function addFile(
  file: Omit<WorkspaceFile, "id" | "uploadedAt">
): void {
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

export function getFilesByAgent(agentId: string): WorkspaceFile[] {
  return getWorkspace().files.filter((f) => f.uploadedInAgent === agentId);
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export function logWorkspaceActivity(
  agentId: string,
  agentName: string,
  action: string,
  summary?: string,
  metadata?: Record<string, unknown>
): void {
  const ws = getWorkspace();
  const entry: WorkspaceActivity = {
    id: nanoid(8),
    agentId,
    agentName,
    action,
    summary: summary || action,
    timestamp: new Date().toISOString(),
    metadata,
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

  // Hotel profile
  if (ws.hotelProfile) {
    const h = ws.hotelProfile;
    lines.push(
      `**Hotel:** ${h.name} · ${h.location} · ${h.rooms} rooms · ADR $${h.adr} · ${h.occupancy}% occ · weak: ${h.weakDays}`
    );
    if (h.targetBusiness.length > 0) {
      lines.push(`**Target segments:** ${h.targetBusiness.join(", ")}`);
    }
    lines.push("");
  }

  // Leads
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
        `  • ${l.fullName} · ${l.jobTitle} · ${l.companyName}${l.industry ? ` (${l.industry})` : ""} · status: ${l.status} · call: ${l.callStatus} · email: ${l.emailCampaignStatus}`
      );
    });
    if (leads.length > 5) lines.push(`  … and ${leads.length - 5} more`);
  } else {
    lines.push("**Leads in workspace:** None yet.");
  }
  lines.push("");

  // Emails
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

  // Sequences
  const activeSeqs = ws.sequences.filter(
    (s) => s.status === "active" || s.status === "scheduled"
  );
  if (activeSeqs.length > 0) {
    lines.push(`**Active sequences:** ${activeSeqs.length}`);
    activeSeqs.slice(0, 3).forEach((s) => {
      lines.push(
        `  • "${s.name}" · ${s.recipientLeadIds.length} recipients · ${s.steps.length} steps · ${s.status}`
      );
    });
    lines.push("");
  }

  // Calls
  const pendingCalls = ws.calls.filter(
    (c) => c.status === "queued" || c.status === "in_progress"
  );
  if (pendingCalls.length > 0) {
    lines.push(`**Pending calls:** ${pendingCalls.length}`);
    pendingCalls.slice(0, 3).forEach((c) => {
      lines.push(
        `  • ${c.leadName} (${c.leadCompany}) · ${c.status} · scheduled: ${c.scheduledFor}`
      );
    });
    lines.push("");
  }

  // Files
  if (ws.files.length > 0) {
    lines.push(`**Files uploaded:** ${ws.files.length}`);
    ws.files.forEach((f) => lines.push(`  • ${f.name}: ${f.summary}`));
    lines.push("");
  }

  // Teammate activity
  const othersActivity = ws.activityLog
    .filter((a) => a.agentId !== currentAgentId)
    .slice(0, 6);
  if (othersActivity.length > 0) {
    lines.push("**Teammate activity:**");
    othersActivity.forEach((a) => {
      lines.push(`  • ${a.agentName}: ${a.summary} (${relTime(a.timestamp)})`);
    });
    lines.push("");
  }

  // Focus
  if (ws.currentFocus) {
    lines.push(`**Team focus:** ${ws.currentFocus}`);
    lines.push("");
  }

  const hasData =
    leads.length > 0 ||
    emails.length > 0 ||
    ws.sequences.length > 0 ||
    ws.calls.length > 0 ||
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
  { id: "dl01", rowNum: 1, firstName: "James", lastName: "Whitfield", fullName: "Dr. James Whitfield", jobTitle: "Chief of Surgery", jobSeniority: "C-Suite", jobDepartment: "Medical", linkedin: "", companyName: "Texas Health Resources", companyWebsite: "txhealth.org", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "j.whitfield@txhealth.org", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "15+ years healthcare leadership", skills: ["surgery", "hospital ops"], interests: [], industry: "Healthcare", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 7200000).toISOString(), funnel: "hustle", status: "new", notes: "Key decision maker for travel block", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl02", rowNum: 2, firstName: "Sarah", lastName: "Martinez", fullName: "Sarah Martinez", jobTitle: "VP of Procurement", jobSeniority: "VP", jobDepartment: "Procurement", linkedin: "", companyName: "UT Southwestern", companyWebsite: "utsw.edu", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "s.martinez@utsw.edu", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "10+ years procurement", skills: ["vendor management", "negotiations"], interests: [], industry: "Healthcare", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 7200000).toISOString(), funnel: "hustle", status: "new", notes: "Controls travel vendor approvals", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl03", rowNum: 3, firstName: "Mike", lastName: "Torres", fullName: "Mike Torres", jobTitle: "Project Director", jobSeniority: "Director", jobDepartment: "Construction", linkedin: "", companyName: "Kimberly-Clark", companyWebsite: "kcc.com", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "m.torres@kcc.com", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "12 years construction mgmt", skills: ["project management", "construction"], interests: [], industry: "Construction", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 7200000).toISOString(), funnel: "hustle", status: "new", notes: "18-month Dallas expansion project", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl04", rowNum: 4, firstName: "Lisa", lastName: "Chen", fullName: "Lisa Chen", jobTitle: "Corporate Travel Manager", jobSeniority: "Manager", jobDepartment: "Travel", linkedin: "", companyName: "AT&T", companyWebsite: "att.com", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "l.chen@att.com", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "8 years corporate travel", skills: ["travel management", "vendor relations"], interests: [], industry: "Technology", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 5400000).toISOString(), funnel: "calculated", status: "new", notes: "500+ room nights per year", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl05", rowNum: 5, firstName: "Robert", lastName: "Kim", fullName: "Robert Kim", jobTitle: "Director of Meetings & Events", jobSeniority: "Director", jobDepartment: "Events", linkedin: "", companyName: "Baylor Scott & White Health", companyWebsite: "bswhealth.com", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "r.kim@bswhealth.com", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "10 years event planning", skills: ["event management", "meetings"], interests: [], industry: "Healthcare", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 5400000).toISOString(), funnel: "hustle", status: "new", notes: "Quarterly conference organizer", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl06", rowNum: 6, firstName: "Jennifer", lastName: "Walsh", fullName: "Jennifer Walsh", jobTitle: "VP Sales Operations", jobSeniority: "VP", jobDepartment: "Sales", linkedin: "", companyName: "Toyota Financial Services", companyWebsite: "toyota.com", companyLinkedin: "", city: "Plano", region: "TX", country: "US", email: "j.walsh@toyota.com", emailStatus: "guessed", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "", skills: ["sales operations"], interests: [], industry: "Finance", source: "vibe", addedBy: "Marcus Reed", addedAt: new Date($now - 5400000).toISOString(), funnel: "calculated", status: "new", notes: "Based in Plano, needs Dallas hotel", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl07", rowNum: 7, firstName: "David", lastName: "Park", fullName: "David Park", jobTitle: "Construction Manager", jobSeniority: "Manager", jobDepartment: "Construction", linkedin: "", companyName: "Hunt Companies", companyWebsite: "huntcompanies.com", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "d.park@huntcompanies.com", emailStatus: "guessed", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "", skills: ["construction management"], interests: [], industry: "Construction", source: "vibe", addedBy: "Marcus Reed", addedAt: new Date($now - 3600000).toISOString(), funnel: "hustle", status: "new", notes: "2-year project crew near property", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl08", rowNum: 8, firstName: "Amanda", lastName: "Ross", fullName: "Amanda Ross", jobTitle: "Regional HR Director", jobSeniority: "Director", jobDepartment: "HR", linkedin: "", companyName: "Lockheed Martin", companyWebsite: "lmco.com", companyLinkedin: "", city: "Fort Worth", region: "TX", country: "US", email: "a.ross@lmco.com", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "", skills: ["HR", "talent acquisition"], interests: [], industry: "Defense", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 3600000).toISOString(), funnel: "calculated", status: "new", notes: "Relocating talent to DFW", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl09", rowNum: 9, firstName: "Carlos", lastName: "Mendoza", fullName: "Carlos Mendoza", jobTitle: "Athletic Director", jobSeniority: "Director", jobDepartment: "Athletics", linkedin: "", companyName: "SMU Athletics", companyWebsite: "smu.edu", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "c.mendoza@smu.edu", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "", skills: ["athletics management"], interests: [], industry: "Sports", source: "agent", addedBy: "Marcus Reed", addedAt: new Date($now - 3600000).toISOString(), funnel: "hustle", status: "new", notes: "Visiting teams travel coordinator", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
  { id: "dl10", rowNum: 10, firstName: "Patricia", lastName: "Hughes", fullName: "Patricia Hughes", jobTitle: "Office Manager", jobSeniority: "Manager", jobDepartment: "Administration", linkedin: "", companyName: "Neiman Marcus Group", companyWebsite: "neimanmarcus.com", companyLinkedin: "", city: "Dallas", region: "TX", country: "US", email: "p.hughes@neimanmarcus.com", emailStatus: "verified", additionalEmails: [], mobilePhone: "", additionalPhones: [], experience: "", skills: ["office management"], interests: [], industry: "Retail", source: "apollo", addedBy: "Marcus Reed", addedAt: new Date($now - 1800000).toISOString(), funnel: "hustle", status: "new", notes: "Buyer events quarterly", callStatus: "not_called", emailCampaignStatus: "not_emailed" },
];

const DEMO_EMAILS: WorkspaceEmail[] = [
  { id: "de01", to: "j.whitfield@txhealth.org", subject: "Room Block Proposal — Texas Health × Westmore Partnership", body: "Dr. Whitfield, your surgical teams work long shifts and deserve a hotel that feels like home...", draftedBy: "Sarah Chen", draftedAt: new Date($now - 3600000).toISOString(), leadId: "dl01", status: "draft" },
  { id: "de02", to: "s.martinez@utsw.edu", subject: "Preferred Vendor Proposal — UT Southwestern × Westmore", body: "Sarah, UT Southwestern books 1,200+ room nights annually in DFW...", draftedBy: "Sarah Chen", draftedAt: new Date($now - 3600000).toISOString(), leadId: "dl02", status: "draft" },
  { id: "de03", to: "m.torres@kcc.com", subject: "Extended-Stay Rate — Construction Crew Block at Westmore", body: "Mike, long-term construction projects need reliable lodging close to the site...", draftedBy: "Sarah Chen", draftedAt: new Date($now - 2700000).toISOString(), leadId: "dl03", status: "queued" },
];

const DEMO_ACTIVITY: WorkspaceActivity[] = [
  { id: "da01", agentId: "02_lead_gen", agentName: "Marcus Reed", action: "found 10 medical + healthcare leads via Apollo in Dallas", summary: "found 10 medical + healthcare leads via Apollo in Dallas", timestamp: new Date($now - 7200000).toISOString() },
  { id: "da02", agentId: "02_lead_gen", agentName: "Marcus Reed", action: "added 5 corporate leads (construction, defense, finance)", summary: "added 5 corporate leads (construction, defense, finance)", timestamp: new Date($now - 5400000).toISOString() },
  { id: "da03", agentId: "03_outbound", agentName: "Sarah Chen", action: "drafted 3 personalized cold emails for top medical leads", summary: "drafted 3 personalized cold emails for top medical leads", timestamp: new Date($now - 3600000).toISOString() },
  { id: "da04", agentId: "01_director", agentName: "Donna Marie", action: "generated weekly plan focused on Sun–Tue corporate occupancy", summary: "generated weekly plan focused on Sun–Tue corporate occupancy", timestamp: new Date($now - 1800000).toISOString() },
];

export function seedDemoWorkspace(): void {
  const ws = getWorkspace();
  if (ws.leads.length > 0) return;
  saveWorkspace({
    hotelProfile: null,
    currentFocus: "Weekday corporate occupancy (Sun–Tue)",
    lastUpdated: new Date().toISOString(),
    leads: DEMO_LEADS,
    emails: DEMO_EMAILS,
    sequences: [],
    calls: [],
    files: [],
    activityLog: DEMO_ACTIVITY,
  });
}
