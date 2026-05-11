"use client";

// ============================================================
// LEAD INTERFACE — 21 data fields + internal metadata
// ============================================================

export type LeadSource = "apollo" | "vibe" | "agent" | "manual";
export type LeadFunnel = "calculated" | "hustle";
export type LeadStatus =
  | "new"
  | "contacted"
  | "replied"
  | "qualified"
  | "closed";
export type EmailStatus = "verified" | "guessed" | "unverified" | "bounced";

export type Lead = {
  // ---- 21 DATA FIELDS ----
  // Personal (4)
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  department?: string;
  seniority?: string;

  // Company (5)
  companyName: string;
  companyWebsite?: string;
  companyLinkedinUrl?: string;
  industry?: string;
  companySize?: string;

  // Contact (6)
  email: string;
  emailStatus: EmailStatus;
  mobilePhone?: string;
  workPhone?: string;
  linkedinUrl?: string;
  location?: string;

  // Background (3)
  yearsExperience?: number;
  skills?: string[];
  summary?: string;

  // Engagement signal (3)
  estAnnualRoomNights?: number;
  whyTheyFit?: string;
  bestFirstTouch?: string;

  // ---- INTERNAL METADATA ----
  id: string;
  source: LeadSource;
  funnel: LeadFunnel;
  status: LeadStatus;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

// ============================================================
// STORAGE
// ============================================================

const STORAGE_KEY = "vhst-leads-vicky-v1";
const SEEDED_FLAG = "vhst-leads-vicky-v1-seeded";
const MAX_LEADS = 500;

type StoredShape = { leads: Lead[]; lastUpdated: string };

function safeRead(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredShape;
    return Array.isArray(parsed.leads) ? parsed.leads : [];
  } catch {
    return [];
  }
}

function safeWrite(leads: Lead[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = leads.slice(0, MAX_LEADS);
    const payload: StoredShape = {
      leads: trimmed,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota or blocked
  }
}

export function newLeadId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getLeads(): Lead[] {
  return safeRead();
}

// Add new leads, dedupe by email+companyName.
export function addLeads(incoming: Lead[]): { added: number; skipped: number } {
  const existing = safeRead();
  const key = (l: Lead) =>
    `${(l.email || "").toLowerCase()}|${(l.companyName || "").toLowerCase()}`;
  const seen = new Set(existing.map(key));
  let added = 0;
  let skipped = 0;
  for (const lead of incoming) {
    if (seen.has(key(lead))) {
      skipped++;
      continue;
    }
    existing.push(lead);
    seen.add(key(lead));
    added++;
  }
  safeWrite(existing);
  return { added, skipped };
}

export function updateLead(id: string, patch: Partial<Lead>) {
  const existing = safeRead();
  const next = existing.map((l) =>
    l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l
  );
  safeWrite(next);
}

export function updateLeadsBulk(ids: string[], patch: Partial<Lead>) {
  const idSet = new Set(ids);
  const existing = safeRead();
  const ts = new Date().toISOString();
  const next = existing.map((l) =>
    idSet.has(l.id) ? { ...l, ...patch, updatedAt: ts } : l
  );
  safeWrite(next);
}

export function deleteLeads(ids: string[]) {
  const idSet = new Set(ids);
  const existing = safeRead();
  safeWrite(existing.filter((l) => !idSet.has(l.id)));
}

export function clearAllLeads() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// ============================================================
// HELPERS
// ============================================================

export function makeLead(partial: Partial<Lead>): Lead {
  const now = new Date().toISOString();
  const firstName = partial.firstName ?? "";
  const lastName = partial.lastName ?? "";
  return {
    firstName,
    lastName,
    fullName:
      partial.fullName ?? (`${firstName} ${lastName}`.trim() || "(unknown)"),
    title: partial.title ?? "",
    department: partial.department,
    seniority: partial.seniority,
    companyName: partial.companyName ?? "",
    companyWebsite: partial.companyWebsite,
    companyLinkedinUrl: partial.companyLinkedinUrl,
    industry: partial.industry,
    companySize: partial.companySize,
    email: partial.email ?? "",
    emailStatus: partial.emailStatus ?? "unverified",
    mobilePhone: partial.mobilePhone,
    workPhone: partial.workPhone,
    linkedinUrl: partial.linkedinUrl,
    location: partial.location,
    yearsExperience: partial.yearsExperience,
    skills: partial.skills,
    summary: partial.summary,
    estAnnualRoomNights: partial.estAnnualRoomNights,
    whyTheyFit: partial.whyTheyFit,
    bestFirstTouch: partial.bestFirstTouch,
    id: partial.id ?? newLeadId(),
    source: partial.source ?? "manual",
    funnel: partial.funnel ?? "calculated",
    status: partial.status ?? "new",
    tags: partial.tags ?? [],
    notes: partial.notes ?? "",
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

// ============================================================
// SAMPLE SEED DATA — 6 Westmore-relevant leads so /leads is never empty
// (Replaced/augmented when the user pulls from Apollo or Vibe in Phase 3)
// ============================================================

export const SEED_LEADS: Lead[] = [
  makeLead({
    id: "seed_001",
    firstName: "Karen",
    lastName: "Whitfield",
    title: "Travel & Lodging Manager",
    department: "Procurement",
    seniority: "Manager",
    companyName: "Texas Health Resources",
    companyWebsite: "https://www.texashealth.org",
    industry: "Hospital & Health Care",
    companySize: "10,001+",
    email: "karen.whitfield@texashealth.org",
    emailStatus: "verified",
    mobilePhone: "+1 (214) 555-0142",
    workPhone: "+1 (682) 236-0000",
    linkedinUrl: "https://linkedin.com/in/karen-whitfield-th",
    location: "Arlington, TX",
    yearsExperience: 11,
    skills: ["Corporate Travel", "Vendor Management", "Negotiation"],
    summary:
      "Manages traveling clinician housing across Texas Health's 25-facility system.",
    estAnnualRoomNights: 1200,
    whyTheyFit: "Multi-site system, traveling clinicians, weekday-heavy",
    bestFirstTouch: "Email + LinkedIn",
    source: "manual",
    funnel: "hustle",
    status: "new",
    tags: ["medical", "long-stay"],
  }),
  makeLead({
    id: "seed_002",
    firstName: "Anita",
    lastName: "Park",
    title: "VP, Travel & Real Estate",
    department: "Workplace Services",
    seniority: "VP",
    companyName: "AT&T Inc.",
    companyWebsite: "https://www.att.com",
    industry: "Telecommunications",
    companySize: "10,001+",
    email: "anita.park@att.com",
    emailStatus: "verified",
    workPhone: "+1 (214) 757-0000",
    linkedinUrl: "https://linkedin.com/in/anitapark-att",
    location: "Dallas, TX",
    yearsExperience: 17,
    skills: ["Corporate Travel", "Real Estate", "Sourcing"],
    summary:
      "Oversees enterprise travel sourcing for AT&T HQ and contractor housing.",
    estAnnualRoomNights: 2400,
    whyTheyFit: "Downtown HQ, vendor & contractor housing",
    bestFirstTouch: "RFP + In-person",
    source: "manual",
    funnel: "calculated",
    status: "new",
    tags: ["fortune500", "downtown"],
  }),
  makeLead({
    id: "seed_003",
    firstName: "Christopher",
    lastName: "Yu",
    title: "Project Travel Lead",
    department: "Resourcing",
    seniority: "Director",
    companyName: "Deloitte Consulting",
    companyWebsite: "https://www2.deloitte.com",
    industry: "Management Consulting",
    companySize: "10,001+",
    email: "cyu@deloitte.com",
    emailStatus: "verified",
    mobilePhone: "+1 (469) 555-0118",
    linkedinUrl: "https://linkedin.com/in/christopher-yu-deloitte",
    location: "Dallas, TX",
    yearsExperience: 14,
    skills: ["Project Staffing", "Travel Optimization", "Vendor Mgmt"],
    summary:
      "Coordinates long-stay project housing for Deloitte's Dallas consulting practice.",
    estAnnualRoomNights: 1800,
    whyTheyFit: "Long-stay consulting teams, weekday-only",
    bestFirstTouch: "LinkedIn + Email",
    source: "manual",
    funnel: "hustle",
    status: "new",
    tags: ["consulting", "long-stay"],
  }),
  makeLead({
    id: "seed_004",
    firstName: "Diane",
    lastName: "Reeves",
    title: "Director, Conference Services",
    department: "Events",
    seniority: "Director",
    companyName: "Southern Methodist University",
    companyWebsite: "https://www.smu.edu",
    industry: "Higher Education",
    companySize: "5,001-10,000",
    email: "dreeves@smu.edu",
    emailStatus: "verified",
    workPhone: "+1 (214) 768-2000",
    linkedinUrl: "https://linkedin.com/in/diane-reeves-smu",
    location: "Dallas, TX",
    yearsExperience: 19,
    skills: ["Event Production", "Higher Ed", "Group Sales"],
    summary:
      "Manages visiting faculty housing, athletics, and alumni events for SMU.",
    estAnnualRoomNights: 350,
    whyTheyFit: "Visiting faculty, athletics, alumni events",
    bestFirstTouch: "Phone",
    source: "manual",
    funnel: "hustle",
    status: "new",
    tags: ["university", "groups"],
  }),
  makeLead({
    id: "seed_005",
    firstName: "Robert",
    lastName: "Cline",
    title: "Travel Coordinator",
    department: "Operations",
    seniority: "Senior",
    companyName: "Lockheed Martin",
    companyWebsite: "https://www.lockheedmartin.com",
    industry: "Aerospace & Defense",
    companySize: "10,001+",
    email: "robert.cline@lmco.com",
    emailStatus: "verified",
    mobilePhone: "+1 (817) 555-0177",
    linkedinUrl: "https://linkedin.com/in/robert-cline-lm",
    location: "Fort Worth, TX",
    yearsExperience: 13,
    skills: ["Government Travel", "Compliance", "Sourcing"],
    summary:
      "Books contractor and government program travel for Lockheed's Fort Worth division.",
    estAnnualRoomNights: 700,
    whyTheyFit: "Government contract teams",
    bestFirstTouch: "RFP",
    source: "manual",
    funnel: "calculated",
    status: "new",
    tags: ["defense", "government"],
  }),
  makeLead({
    id: "seed_006",
    firstName: "Tyler",
    lastName: "Brennan",
    title: "VP, Operations",
    department: "Front Office",
    seniority: "VP",
    companyName: "Dallas Mavericks",
    companyWebsite: "https://www.mavs.com",
    industry: "Sports",
    companySize: "201-500",
    email: "tbrennan@mavs.com",
    emailStatus: "guessed",
    linkedinUrl: "https://linkedin.com/in/tyler-brennan-mavs",
    location: "Dallas, TX",
    yearsExperience: 9,
    skills: ["Sports Ops", "Team Travel", "Logistics"],
    summary:
      "Handles visiting media, scouts, and front-office travel for the Mavs.",
    estAnnualRoomNights: 250,
    whyTheyFit: "Visiting media, scouts, executives",
    bestFirstTouch: "LinkedIn",
    source: "manual",
    funnel: "hustle",
    status: "new",
    tags: ["sports", "entertainment"],
  }),
];

// On first ever load, seed if empty.
export function ensureSeeded(): Lead[] {
  if (typeof window === "undefined") return SEED_LEADS;
  const seenSeed = window.localStorage.getItem(SEEDED_FLAG);
  const current = safeRead();
  if (current.length === 0 && !seenSeed) {
    safeWrite(SEED_LEADS);
    window.localStorage.setItem(SEEDED_FLAG, "1");
    return SEED_LEADS;
  }
  return current;
}

// ============================================================
// FILTER / SEARCH
// ============================================================

export type LeadFilters = {
  search?: string;
  funnel?: LeadFunnel | "all";
  status?: LeadStatus | "all";
  source?: LeadSource | "all";
  tag?: string;
};

export function filterLeads(leads: Lead[], f: LeadFilters): Lead[] {
  const search = (f.search || "").trim().toLowerCase();
  return leads.filter((l) => {
    if (f.funnel && f.funnel !== "all" && l.funnel !== f.funnel) return false;
    if (f.status && f.status !== "all" && l.status !== f.status) return false;
    if (f.source && f.source !== "all" && l.source !== f.source) return false;
    if (f.tag && !l.tags.includes(f.tag)) return false;
    if (search) {
      const hay = [
        l.fullName,
        l.title,
        l.companyName,
        l.email,
        l.location,
        l.industry,
        ...(l.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

// ============================================================
// LABELS — for UI rendering
// ============================================================

export const STATUS_LABEL: Record<LeadStatus, { label: string; color: string }> =
  {
    new: { label: "New", color: "bg-mhsp-cream-warm text-mhsp-navy border-mhsp-line" },
    contacted: {
      label: "Contacted",
      color: "bg-mhsp-teal/10 text-mhsp-teal border-mhsp-teal/30",
    },
    replied: {
      label: "Replied",
      color: "bg-mhsp-gold/15 text-mhsp-navy border-mhsp-gold/40",
    },
    qualified: {
      label: "Qualified",
      color: "bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30",
    },
    closed: {
      label: "Closed",
      color: "bg-mhsp-navy text-white border-mhsp-navy",
    },
  };

export const SOURCE_LABEL: Record<LeadSource, string> = {
  apollo: "🎯 Apollo",
  vibe: "⚡ Vibe",
  agent: "🤖 Agent",
  manual: "✍️ Manual",
};

export const FUNNEL_LABEL: Record<LeadFunnel, string> = {
  calculated: "🎯 Calculated",
  hustle: "⚡ Hustle",
};
