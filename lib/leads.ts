import { nanoid } from "nanoid";
import * as XLSX from "xlsx";

export type LeadStatus =
  | "new"
  | "contacted"
  | "replied"
  | "qualified"
  | "closed";
export type LeadFunnel = "calculated" | "hustle";
export type LeadSource = "apollo" | "vibe" | "agent_generated" | "manual";
export type LeadEmailStatus = "verified" | "guessed" | "unverified";

export interface Lead {
  id: string;
  rowNum: number;
  prospectFirstName: string;
  prospectLastName: string;
  prospectFullName: string;
  prospectJobTitle: string;
  prospectLinkedin: string;
  prospectJobSeniorityLevel: string;
  prospectJobDepartment: string;
  prospectCountryName: string;
  prospectRegionName: string;
  prospectCity: string;
  prospectExperience: string;
  prospectSkills: string[];
  prospectInterests: string[];
  prospectCompanyName: string;
  prospectCompanyWebsite: string;
  prospectCompanyLinkedin: string;
  contactProfessionalEmail: string;
  contactProfessionalEmailStatus: LeadEmailStatus;
  contactEmails: string[];
  contactMobilePhone: string;
  contactPhoneNumbers: string[];
  source: LeadSource;
  createdAt: string;
  hotelProfile: string;
  agentId: string;
  status: LeadStatus;
  funnel: LeadFunnel;
  notes: string;
}

const STORAGE_KEY = "vhst-leads";
const MAX_LEADS = 500;

/** Make sure every required field exists; fill blanks with safe defaults. */
function normalize(input: Partial<Lead>, rowNum: number): Lead {
  const first = input.prospectFirstName?.trim() ?? "";
  const last = input.prospectLastName?.trim() ?? "";
  const full = input.prospectFullName?.trim() || [first, last].filter(Boolean).join(" ");
  return {
    id: input.id ?? nanoid(),
    rowNum,
    prospectFirstName: first,
    prospectLastName: last,
    prospectFullName: full,
    prospectJobTitle: input.prospectJobTitle ?? "",
    prospectLinkedin: input.prospectLinkedin ?? "",
    prospectJobSeniorityLevel: input.prospectJobSeniorityLevel ?? "",
    prospectJobDepartment: input.prospectJobDepartment ?? "",
    prospectCountryName: input.prospectCountryName ?? "",
    prospectRegionName: input.prospectRegionName ?? "",
    prospectCity: input.prospectCity ?? "",
    prospectExperience: input.prospectExperience ?? "",
    prospectSkills: input.prospectSkills ?? [],
    prospectInterests: input.prospectInterests ?? [],
    prospectCompanyName: input.prospectCompanyName ?? "",
    prospectCompanyWebsite: input.prospectCompanyWebsite ?? "",
    prospectCompanyLinkedin: input.prospectCompanyLinkedin ?? "",
    contactProfessionalEmail: input.contactProfessionalEmail ?? "",
    contactProfessionalEmailStatus:
      input.contactProfessionalEmailStatus ?? "unverified",
    contactEmails: input.contactEmails ?? [],
    contactMobilePhone: input.contactMobilePhone ?? "",
    contactPhoneNumbers: input.contactPhoneNumbers ?? [],
    source: input.source ?? "manual",
    createdAt: input.createdAt ?? new Date().toISOString(),
    hotelProfile: input.hotelProfile ?? "",
    agentId: input.agentId ?? "",
    status: input.status ?? "new",
    funnel: input.funnel ?? "hustle",
    notes: input.notes ?? "",
  };
}

/* -------- read / write -------- */

export function getAllLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x === "object") as Lead[];
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]): void {
  if (typeof window === "undefined") return;
  // Cap at MAX_LEADS — drop the oldest by createdAt
  const sorted = [...leads].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const trimmed = sorted.slice(-MAX_LEADS);
  // Re-number rowNum so it reads 1..N regardless of churn
  const renumbered = trimmed.map((l, i) => ({ ...l, rowNum: i + 1 }));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(renumbered));
    window.dispatchEvent(new CustomEvent("vhst-leads-changed"));
  } catch {
    // localStorage quota error — swallow, the UI will just not persist
  }
}

export function addLeads(newLeads: Partial<Lead>[]): Lead[] {
  const existing = getAllLeads();
  const startRow = existing.length;
  const incoming = newLeads.map((l, i) => normalize(l, startRow + i + 1));
  const merged = [...existing, ...incoming];
  saveLeads(merged);
  return incoming;
}

export function deleteLead(id: string): void {
  const all = getAllLeads();
  saveLeads(all.filter((l) => l.id !== id));
}

export function deleteLeads(ids: string[]): void {
  const set = new Set(ids);
  const all = getAllLeads();
  saveLeads(all.filter((l) => !set.has(l.id)));
}

export function updateLead(id: string, patch: Partial<Lead>): void {
  const all = getAllLeads();
  saveLeads(all.map((l) => (l.id === id ? { ...l, ...patch, id: l.id } : l)));
}

export function clearAllLeads(): void {
  saveLeads([]);
}

/* -------- filters -------- */

export function getLeadsByAgent(agentId: string): Lead[] {
  return getAllLeads().filter((l) => l.agentId === agentId);
}

export function getLeadsByStatus(status: LeadStatus): Lead[] {
  return getAllLeads().filter((l) => l.status === status);
}

export function getLeadsByFunnel(funnel: LeadFunnel): Lead[] {
  return getAllLeads().filter((l) => l.funnel === funnel);
}

/* -------- export -------- */

const COLUMN_HEADERS: { key: keyof Lead; label: string }[] = [
  { key: "rowNum", label: "#" },
  { key: "prospectFullName", label: "Full Name" },
  { key: "prospectFirstName", label: "First Name" },
  { key: "prospectLastName", label: "Last Name" },
  { key: "prospectJobTitle", label: "Job Title" },
  { key: "prospectJobSeniorityLevel", label: "Seniority" },
  { key: "prospectJobDepartment", label: "Department" },
  { key: "prospectCompanyName", label: "Company" },
  { key: "prospectCompanyWebsite", label: "Company Website" },
  { key: "prospectCompanyLinkedin", label: "Company LinkedIn" },
  { key: "prospectLinkedin", label: "Prospect LinkedIn" },
  { key: "prospectCity", label: "City" },
  { key: "prospectRegionName", label: "Region" },
  { key: "prospectCountryName", label: "Country" },
  { key: "prospectExperience", label: "Experience" },
  { key: "prospectSkills", label: "Skills" },
  { key: "prospectInterests", label: "Interests" },
  { key: "contactProfessionalEmail", label: "Email" },
  { key: "contactProfessionalEmailStatus", label: "Email Status" },
  { key: "contactEmails", label: "Other Emails" },
  { key: "contactMobilePhone", label: "Mobile" },
  { key: "contactPhoneNumbers", label: "Other Phones" },
  { key: "source", label: "Source" },
  { key: "funnel", label: "Funnel" },
  { key: "status", label: "Status" },
  { key: "agentId", label: "Captured By" },
  { key: "createdAt", label: "Added" },
  { key: "notes", label: "Notes" },
];

function cellValue(lead: Lead, key: keyof Lead): string {
  const v = lead[key];
  if (Array.isArray(v)) return v.join("; ");
  if (v == null) return "";
  return String(v);
}

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportLeadsAsCSV(leads: Lead[]): string {
  const header = COLUMN_HEADERS.map((c) => csvEscape(c.label)).join(",");
  const rows = leads.map((l) =>
    COLUMN_HEADERS.map((c) => csvEscape(cellValue(l, c.key))).join(","),
  );
  return [header, ...rows].join("\n");
}

export function exportLeadsAsExcel(leads: Lead[]): Blob {
  const rows = leads.map((l) => {
    const row: Record<string, string> = {};
    for (const c of COLUMN_HEADERS) row[c.label] = cellValue(l, c.key);
    return row;
  });
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: COLUMN_HEADERS.map((c) => c.label),
  });
  // Sensible column widths
  worksheet["!cols"] = COLUMN_HEADERS.map((c) => ({
    wch: Math.max(c.label.length, 12),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  const buf = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/* -------- helpers (downloads) -------- */

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
