import { promises as fs } from "fs";
import path from "path";

export type ApolloApiContact = {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  last_name_obfuscated?: string;
  title?: string;
  seniority?: string;
  departments?: string[];
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  city?: string;
  state?: string;
  country?: string;
  mobile_phone?: string;
  phone_numbers?: Array<{ sanitized_number?: string; type?: string }>;
  organization?: {
    name?: string;
    website_url?: string;
    linkedin_url?: string;
    industry?: string;
    primary_domain?: string;
  };
};

export type MappedLead = {
  // Compact schema used in Marcus chat
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedin: string;
  city: string;
  state: string;
  country: string;
  department: string;
  industry: string;
  companyWebsite: string;
  companyLinkedin: string;
  seniority: string;
  // Workspace / legacy schema
  fullName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  jobSeniority: string;
  companyName: string;
  emailStatus: string;
  region: string;
  mobilePhone: string;
  // Lead table schema (prospect* / contact* keys)
  prospectFullName: string;
  prospectFirstName: string;
  prospectLastName: string;
  prospectJobTitle: string;
  prospectJobSeniorityLevel: string;
  prospectJobDepartment: string;
  prospectLinkedin: string;
  prospectCity: string;
  prospectRegionName: string;
  prospectCountryName: string;
  prospectCompanyName: string;
  prospectCompanyWebsite: string;
  prospectCompanyLinkedin: string;
  contactProfessionalEmail: string;
  contactProfessionalEmailStatus: string;
  contactMobilePhone: string;
  contactPhoneNumbers: string[];
  source: "apollo";
  funnel: "hustle";
  status: "new";
};

export type ApolloContactsFile = {
  generatedAt: string;
  totalContacts: number;
  source: string;
  contacts: MappedLead[];
};

const FILE_PATH = path.join(process.cwd(), "sample-data", "apollo-contacts.json");

let _cache: ApolloContactsFile | null = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function loadApolloContacts(): Promise<ApolloContactsFile | null> {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL_MS) return _cache;
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    _cache = JSON.parse(raw) as ApolloContactsFile;
    _cacheTime = now;
    return _cache;
  } catch {
    return null;
  }
}

export function invalidateCache() {
  _cache = null;
  _cacheTime = 0;
}

function prettifySeniority(s?: string): string {
  if (!s) return "";
  if (s === "c_suite") return "C-Suite";
  return s
    .split("_")
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function prettifyDepartment(raw?: string): string {
  if (!raw) return "";
  const map: Record<string, string> = {
    c_suite: "Executive",
    engineering_technical: "Engineering",
    sales: "Sales",
    marketing: "Marketing",
    operations: "Operations",
    finance: "Finance",
    human_resources: "Human Resources",
    information_technology: "Information Technology",
    legal: "Legal",
    media_communications: "Communications",
    education: "Education",
    medical_health: "Medical",
    real_estate: "Real Estate",
    consulting: "Consulting",
    design: "Design",
    data_analytics: "Data & Analytics",
    product_management: "Product Management",
    project_management: "Project Management",
    business_development: "Business Development",
    customer_service: "Customer Service",
    supply_chain: "Supply Chain",
    accounting: "Accounting",
  };
  return (
    map[raw.toLowerCase()] ??
    raw
      .split("_")
      .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ")
  );
}

function normalizeUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function mapApolloContact(p: ApolloApiContact): MappedLead {
  const org = p.organization ?? {};
  const hasEmail = Boolean(p.email && !/email_not_unlocked|locked/i.test(p.email));
  const fullName =
    p.name ||
    `${p.first_name ?? ""} ${p.last_name ?? p.last_name_obfuscated ?? ""}`.trim() ||
    "Apollo Contact";
  const phone =
    p.phone_numbers?.find((n) => n.sanitized_number)?.sanitized_number ??
    p.mobile_phone ??
    "";
  const dept =
    Array.isArray(p.departments) && p.departments.length > 0 ? p.departments[0] : "";
  const seniority = prettifySeniority(p.seniority);
  const email = hasEmail ? (p.email as string) : "";
  const emailStatus = hasEmail
    ? p.email_status === "verified"
      ? "verified"
      : "guessed"
    : "unverified";
  const industry = org.industry ?? "";
  const deptPretty = prettifyDepartment(dept);
  const linkedin = normalizeUrl(p.linkedin_url);
  const companyWebsite = normalizeUrl(org.website_url);
  const companyLinkedin = normalizeUrl(org.linkedin_url);

  return {
    name: fullName,
    title: p.title ?? "",
    company: org.name ?? "",
    email,
    phone,
    linkedin,
    city: p.city ?? "",
    state: p.state ?? "",
    country: p.country || "United States",
    department: deptPretty,
    industry,
    companyWebsite,
    companyLinkedin,
    seniority,
    fullName,
    firstName: p.first_name ?? "",
    lastName: p.last_name ?? "",
    jobTitle: p.title ?? "",
    jobSeniority: seniority,
    companyName: org.name ?? "",
    emailStatus,
    region: p.state ?? "",
    mobilePhone: phone,
    prospectFullName: fullName,
    prospectFirstName: p.first_name ?? "",
    prospectLastName: p.last_name ?? "",
    prospectJobTitle: p.title ?? "",
    prospectJobSeniorityLevel: seniority,
    prospectJobDepartment: deptPretty,
    prospectLinkedin: linkedin,
    prospectCity: p.city ?? "",
    prospectRegionName: p.state ?? "",
    prospectCountryName: p.country || "United States",
    prospectCompanyName: org.name ?? "",
    prospectCompanyWebsite: companyWebsite,
    prospectCompanyLinkedin: companyLinkedin,
    contactProfessionalEmail: email,
    contactProfessionalEmailStatus: emailStatus,
    contactMobilePhone: phone,
    contactPhoneNumbers: (p.phone_numbers ?? [])
      .map((n) => n.sanitized_number)
      .filter((n): n is string => Boolean(n)),
    source: "apollo",
    funnel: "hustle",
    status: "new",
  };
}

const SENIORITY_RANK: Record<string, number> = {
  Manager: 1,
  Senior: 1,
  Director: 2,
  VP: 3,
  "C-Suite": 4,
};

export function filterLeads(
  leads: MappedLead[],
  opts: { seniority?: string; count?: number },
): MappedLead[] {
  let filtered = leads;
  if (opts.seniority && opts.seniority !== "Any") {
    const label = opts.seniority.replace("+", "");
    const minRank = SENIORITY_RANK[label] ?? 1;
    const exclusive = !opts.seniority.includes("+");
    filtered = filtered.filter((l) => {
      const rank = SENIORITY_RANK[l.seniority] ?? 0;
      return exclusive ? rank === minRank : rank >= minRank;
    });
  }
  if (opts.count && opts.count > 0) filtered = filtered.slice(0, opts.count);
  return filtered;
}
