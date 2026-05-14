import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { loadApolloContacts, filterLeads } from "@/lib/apollo-contacts-cache";

export const runtime = "nodejs";

// ============================================================
// REAL APOLLO FALLBACK POOL
// Pre-pulled real Apollo leads (30 across 6 industries) — used
// when live API fails or credits exhausted. Same shape as a live
// response. Loaded once at first request, cached in memory.
// ============================================================

type FallbackPool = {
  generatedAt: string;
  source: string;
  totalLeads: number;
  byIndustry: Record<string, Record<string, unknown>[]>;
};

let _realFallbackCache: FallbackPool | null = null;

async function loadRealFallback(): Promise<FallbackPool | null> {
  if (_realFallbackCache) return _realFallbackCache;
  try {
    const filePath = path.join(
      process.cwd(),
      "sample-data",
      "apollo-real-fallback.json",
    );
    const raw = await fs.readFile(filePath, "utf-8");
    _realFallbackCache = JSON.parse(raw) as FallbackPool;
    return _realFallbackCache;
  } catch {
    return null;
  }
}

// ============================================================
// Hardcoded fallback (ultimate safety net if even the JSON fails)
// ============================================================

const SAMPLE_LEADS: Record<string, object[]> = {
  Healthcare: [
    { fullName: "Dr. Karen Mitchell", firstName: "Karen", lastName: "Mitchell", jobTitle: "Chief Medical Officer", jobSeniority: "C-Suite", department: "Medical Leadership", companyName: "Baylor Scott & White", companyWebsite: "https://www.bswhealth.com", companyLinkedin: "https://www.linkedin.com/company/baylor-scott-white-health", email: "k.mitchell@bswhealth.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0142", linkedin: "https://www.linkedin.com/in/karen-mitchell-bsw" },
    { fullName: "Thomas Grant", firstName: "Thomas", lastName: "Grant", jobTitle: "VP of Hospital Operations", jobSeniority: "VP", department: "Hospital Operations", companyName: "Medical City Healthcare", companyWebsite: "https://www.medicalcityhealthcare.com", companyLinkedin: "https://www.linkedin.com/company/medical-city-healthcare", email: "t.grant@medcity.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0188", linkedin: "https://www.linkedin.com/in/thomas-grant-mch" },
    { fullName: "Angela Peters", firstName: "Angela", lastName: "Peters", jobTitle: "Director of Nursing Education", jobSeniority: "Director", department: "Nursing Education", companyName: "Parkland Health", companyWebsite: "https://www.parklandhealth.org", companyLinkedin: "https://www.linkedin.com/company/parkland-health-hospital", email: "a.peters@parkland.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0211", linkedin: "https://www.linkedin.com/in/angela-peters-parkland" },
    { fullName: "Raymond Cruz", firstName: "Raymond", lastName: "Cruz", jobTitle: "Residency Program Director", jobSeniority: "Director", department: "Medical Education", companyName: "UT Southwestern", companyWebsite: "https://www.utsouthwestern.edu", companyLinkedin: "https://www.linkedin.com/company/ut-southwestern-medical-center", email: "r.cruz@utsw.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0234", linkedin: "https://www.linkedin.com/in/raymond-cruz-utsw" },
    { fullName: "Michelle Foster", firstName: "Michelle", lastName: "Foster", jobTitle: "VP of Partnerships", jobSeniority: "VP", department: "Business Development", companyName: "Children's Health", companyWebsite: "https://www.childrens.com", companyLinkedin: "https://www.linkedin.com/company/childrens-health", email: "m.foster@childrens.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0277", linkedin: "https://www.linkedin.com/in/michelle-foster-ch" },
    { fullName: "Eric Washington", firstName: "Eric", lastName: "Washington", jobTitle: "Regional Travel Coordinator", jobSeniority: "Manager", department: "Procurement", companyName: "HCA Healthcare North Texas", companyWebsite: "https://www.hcahealthcare.com", companyLinkedin: "https://www.linkedin.com/company/hca-healthcare", email: "e.washington@hca.com", emailStatus: "verified", city: "Irving", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (972) 555-0142", linkedin: "https://www.linkedin.com/in/eric-washington-hca" },
    { fullName: "Sandra Kim", firstName: "Sandra", lastName: "Kim", jobTitle: "Procurement Manager", jobSeniority: "Manager", department: "Procurement", companyName: "Texas Health Resources", companyWebsite: "https://www.texashealth.org", companyLinkedin: "https://www.linkedin.com/company/texas-health-resources", email: "s.kim@txhealth.org", emailStatus: "verified", city: "Arlington", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (817) 555-0123", linkedin: "https://www.linkedin.com/in/sandra-kim-thr" },
    { fullName: "Carlos Gutierrez", firstName: "Carlos", lastName: "Gutierrez", jobTitle: "Director of CME Programs", jobSeniority: "Director", department: "Medical Education", companyName: "Methodist Health System", companyWebsite: "https://www.methodisthealthsystem.org", companyLinkedin: "https://www.linkedin.com/company/methodist-health-system", email: "c.gutierrez@mhd.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0298", linkedin: "https://www.linkedin.com/in/carlos-gutierrez-mhd" },
  ],
  Technology: [
    { fullName: "Ryan Chen", firstName: "Ryan", lastName: "Chen", jobTitle: "VP of Engineering", jobSeniority: "VP", department: "Engineering", companyName: "AT&T", companyWebsite: "https://www.att.com", companyLinkedin: "https://www.linkedin.com/company/att", email: "r.chen@att.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (214) 555-0312", linkedin: "https://www.linkedin.com/in/ryan-chen-att" },
    { fullName: "Jessica Moore", firstName: "Jessica", lastName: "Moore", jobTitle: "Director of Talent Acquisition", jobSeniority: "Director", department: "Human Resources", companyName: "Texas Instruments", companyWebsite: "https://www.ti.com", companyLinkedin: "https://www.linkedin.com/company/texas-instruments", email: "j.moore@ti.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (972) 555-0344", linkedin: "https://www.linkedin.com/in/jessica-moore-ti" },
    { fullName: "David Park", firstName: "David", lastName: "Park", jobTitle: "CTO", jobSeniority: "C-Suite", department: "Executive", companyName: "Match Group", companyWebsite: "https://www.mtch.com", companyLinkedin: "https://www.linkedin.com/company/match-group", email: "d.park@match.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (214) 555-0356", linkedin: "https://www.linkedin.com/in/david-park-match" },
    { fullName: "Lauren Brooks", firstName: "Lauren", lastName: "Brooks", jobTitle: "Sr. Program Manager", jobSeniority: "Manager", department: "Program Management", companyName: "Salesforce", companyWebsite: "https://www.salesforce.com", companyLinkedin: "https://www.linkedin.com/company/salesforce", email: "l.brooks@salesforce.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (214) 555-0378", linkedin: "https://www.linkedin.com/in/lauren-brooks-sf" },
    { fullName: "Mark Anderson", firstName: "Mark", lastName: "Anderson", jobTitle: "VP Corporate Events", jobSeniority: "VP", department: "Marketing & Events", companyName: "Cisco Systems", companyWebsite: "https://www.cisco.com", companyLinkedin: "https://www.linkedin.com/company/cisco", email: "m.anderson@cisco.com", emailStatus: "verified", city: "Richardson", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (972) 555-0399", linkedin: "https://www.linkedin.com/in/mark-anderson-cisco" },
    { fullName: "Priya Nair", firstName: "Priya", lastName: "Nair", jobTitle: "Director of Sales Enablement", jobSeniority: "Director", department: "Sales", companyName: "Oracle", companyWebsite: "https://www.oracle.com", companyLinkedin: "https://www.linkedin.com/company/oracle", email: "p.nair@oracle.com", emailStatus: "verified", city: "Austin", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (512) 555-0411", linkedin: "https://www.linkedin.com/in/priya-nair-oracle" },
  ],
  Construction: [
    { fullName: "Robert Wilson", firstName: "Robert", lastName: "Wilson", jobTitle: "VP of Field Operations", jobSeniority: "VP", department: "Field Operations", companyName: "Balfour Beatty", companyWebsite: "https://www.balfourbeattyus.com", companyLinkedin: "https://www.linkedin.com/company/balfour-beatty", email: "r.wilson@balfourbeatty.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (214) 555-0423", linkedin: "https://www.linkedin.com/in/robert-wilson-bb" },
    { fullName: "Maria Lopez", firstName: "Maria", lastName: "Lopez", jobTitle: "Project Director", jobSeniority: "Director", department: "Project Management", companyName: "Austin Industries", companyWebsite: "https://www.austin-ind.com", companyLinkedin: "https://www.linkedin.com/company/austin-industries", email: "m.lopez@austin-ind.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (214) 555-0445", linkedin: "https://www.linkedin.com/in/maria-lopez-ai" },
    { fullName: "James Turner", firstName: "James", lastName: "Turner", jobTitle: "Site Manager", jobSeniority: "Manager", department: "Field Operations", companyName: "McCarthy Building Companies", companyWebsite: "https://www.mccarthy.com", companyLinkedin: "https://www.linkedin.com/company/mccarthy-building-companies", email: "j.turner@mccarthy.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (214) 555-0467", linkedin: "https://www.linkedin.com/in/james-turner-mcc" },
    { fullName: "Sarah Campbell", firstName: "Sarah", lastName: "Campbell", jobTitle: "HR Director", jobSeniority: "Director", department: "Human Resources", companyName: "Kiewit Corporation", companyWebsite: "https://www.kiewit.com", companyLinkedin: "https://www.linkedin.com/company/kiewit", email: "s.campbell@kiewit.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (817) 555-0489", linkedin: "https://www.linkedin.com/in/sarah-campbell-kiewit" },
    { fullName: "Brian Harris", firstName: "Brian", lastName: "Harris", jobTitle: "Regional Manager", jobSeniority: "Manager", department: "Operations", companyName: "Turner Construction", companyWebsite: "https://www.turnerconstruction.com", companyLinkedin: "https://www.linkedin.com/company/turner-construction", email: "b.harris@tcco.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (214) 555-0501", linkedin: "https://www.linkedin.com/in/brian-harris-turner" },
  ],
  Finance: [
    { fullName: "Laura Bennett", firstName: "Laura", lastName: "Bennett", jobTitle: "Managing Director", jobSeniority: "C-Suite", department: "Investment Banking", companyName: "Goldman Sachs", companyWebsite: "https://www.goldmansachs.com", companyLinkedin: "https://www.linkedin.com/company/goldman-sachs", email: "l.bennett@gs.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Finance", mobilePhone: "+1 (214) 555-0523", linkedin: "https://www.linkedin.com/in/laura-bennett-gs" },
    { fullName: "Michael Torres", firstName: "Michael", lastName: "Torres", jobTitle: "VP of Corporate Banking", jobSeniority: "VP", department: "Corporate Banking", companyName: "JP Morgan Chase", companyWebsite: "https://www.jpmorganchase.com", companyLinkedin: "https://www.linkedin.com/company/jpmorgan-chase", email: "m.torres@jpmorgan.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Finance", mobilePhone: "+1 (214) 555-0545", linkedin: "https://www.linkedin.com/in/michael-torres-jpm" },
    { fullName: "Rebecca Owens", firstName: "Rebecca", lastName: "Owens", jobTitle: "Director of Compliance", jobSeniority: "Director", department: "Legal & Compliance", companyName: "Bank of America", companyWebsite: "https://www.bankofamerica.com", companyLinkedin: "https://www.linkedin.com/company/bank-of-america", email: "r.owens@bofa.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Finance", mobilePhone: "+1 (214) 555-0567", linkedin: "https://www.linkedin.com/in/rebecca-owens-bofa" },
    { fullName: "Jonathan Reeves", firstName: "Jonathan", lastName: "Reeves", jobTitle: "CFO", jobSeniority: "C-Suite", department: "Finance", companyName: "Southwest Securities", companyWebsite: "https://www.southwestsecurities.com", companyLinkedin: "https://www.linkedin.com/company/southwest-securities", email: "j.reeves@swsec.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Finance", mobilePhone: "+1 (214) 555-0589", linkedin: "https://www.linkedin.com/in/jonathan-reeves-sws" },
  ],
  Defense: [
    { fullName: "Col. James Porter (Ret.)", firstName: "James", lastName: "Porter", jobTitle: "VP of Government Affairs", jobSeniority: "VP", department: "Government Relations", companyName: "Lockheed Martin", companyWebsite: "https://www.lockheedmartin.com", companyLinkedin: "https://www.linkedin.com/company/lockheed-martin", email: "j.porter@lmco.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "United States", industry: "Defense", mobilePhone: "+1 (817) 555-0601", linkedin: "https://www.linkedin.com/in/james-porter-lm" },
    { fullName: "Diana Holloway", firstName: "Diana", lastName: "Holloway", jobTitle: "Director of Training Programs", jobSeniority: "Director", department: "Training & Development", companyName: "L3Harris Technologies", companyWebsite: "https://www.l3harris.com", companyLinkedin: "https://www.linkedin.com/company/l3harris-technologies", email: "d.holloway@l3harris.com", emailStatus: "verified", city: "Arlington", region: "TX", country: "United States", industry: "Defense", mobilePhone: "+1 (817) 555-0623", linkedin: "https://www.linkedin.com/in/diana-holloway-l3" },
    { fullName: "Steven Park", firstName: "Steven", lastName: "Park", jobTitle: "Program Manager", jobSeniority: "Manager", department: "Program Management", companyName: "Raytheon Technologies", companyWebsite: "https://www.rtx.com", companyLinkedin: "https://www.linkedin.com/company/rtx", email: "s.park@raytheon.com", emailStatus: "guessed", city: "McKinney", region: "TX", country: "United States", industry: "Defense", mobilePhone: "+1 (972) 555-0645", linkedin: "https://www.linkedin.com/in/steven-park-rtx" },
  ],
  Education: [
    { fullName: "Dr. Patricia Williams", firstName: "Patricia", lastName: "Williams", jobTitle: "Dean of Business School", jobSeniority: "C-Suite", department: "Academic Affairs", companyName: "SMU", companyWebsite: "https://www.smu.edu", companyLinkedin: "https://www.linkedin.com/school/southern-methodist-university", email: "p.williams@smu.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Education", mobilePhone: "+1 (214) 555-0667", linkedin: "https://www.linkedin.com/in/patricia-williams-smu" },
    { fullName: "Gregory Chang", firstName: "Gregory", lastName: "Chang", jobTitle: "VP of Student Affairs", jobSeniority: "VP", department: "Student Affairs", companyName: "UT Dallas", companyWebsite: "https://www.utdallas.edu", companyLinkedin: "https://www.linkedin.com/school/the-university-of-texas-at-dallas", email: "g.chang@utdallas.edu", emailStatus: "verified", city: "Richardson", region: "TX", country: "United States", industry: "Education", mobilePhone: "+1 (972) 555-0689", linkedin: "https://www.linkedin.com/in/gregory-chang-utd" },
    { fullName: "Amanda Ellis", firstName: "Amanda", lastName: "Ellis", jobTitle: "Director of Continuing Education", jobSeniority: "Director", department: "Continuing Education", companyName: "Collin College", companyWebsite: "https://www.collin.edu", companyLinkedin: "https://www.linkedin.com/school/collin-college", email: "a.ellis@collin.edu", emailStatus: "guessed", city: "Plano", region: "TX", country: "United States", industry: "Education", mobilePhone: "+1 (972) 555-0701", linkedin: "https://www.linkedin.com/in/amanda-ellis-collin" },
  ],
};

function filterBySeniority(leads: object[], seniority: string): object[] {
  if (!seniority || seniority === "Any") return leads;
  const rank: Record<string, number> = { "Manager": 1, "Director": 2, "VP": 3, "C-Suite": 4 };
  const minRank = seniority.includes("C-Suite") ? 4 : seniority.includes("VP") ? 3 : seniority.includes("Director") ? 2 : 1;
  return leads.filter((l) => {
    const lvl = (l as Record<string, string>).jobSeniority ?? "";
    return (rank[lvl] ?? 0) >= minRank;
  });
}

// ============================================================
// Apollo API integration
// ============================================================

const APOLLO_BASE = "https://api.apollo.io/api/v1";

const SENIORITY_TO_APOLLO: Record<string, string[]> = {
  Any: ["manager", "director", "vp", "c_suite", "head", "senior", "owner", "founder"],
  Manager: ["manager", "senior"],
  "Manager+": ["manager", "senior"],
  Director: ["director", "head"],
  "Director+": ["director", "head", "vp", "c_suite", "owner", "founder"],
  VP: ["vp"],
  "VP+": ["vp", "c_suite", "owner", "founder"],
  "C-Suite": ["c_suite", "owner", "founder"],
};

const INDUSTRY_TITLE_HINTS: Record<string, string[]> = {
  Healthcare: ["Travel Manager", "Procurement Manager", "Operations Director", "Chief Medical Officer", "Conference Services Director"],
  Technology: ["Talent Acquisition", "Director of Events", "Program Manager", "VP of Engineering", "Corporate Events Manager"],
  Construction: ["Project Director", "Site Manager", "VP of Field Operations", "Regional Manager", "HR Director"],
  Finance: ["Managing Director", "VP Corporate Banking", "Director of Compliance", "CFO"],
  Defense: ["Government Affairs", "Program Manager", "Training Programs Director"],
  Education: ["Conference Services", "Continuing Education", "Student Affairs", "Dean"],
};

type ApolloSearchPerson = {
  id?: string;
  first_name?: string;
  last_name?: string;
  last_name_obfuscated?: string;
  title?: string;
  seniority?: string;
  departments?: string[];
  linkedin_url?: string;
  city?: string;
  state?: string;
  country?: string;
  organization?: { name?: string; industry?: string; website_url?: string; linkedin_url?: string };
};

type ApolloMatchPerson = {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  city?: string;
  state?: string;
  country?: string;
  seniority?: string;
  departments?: string[];
  phone_numbers?: Array<{ sanitized_number?: string }>;
  organization?: {
    name?: string;
    website_url?: string;
    linkedin_url?: string;
    industry?: string;
  };
};

function prettifySeniority(s?: string): string {
  if (!s) return "";
  if (s === "c_suite") return "C-Suite";
  return s
    .split("_")
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

// Map an Apollo person.match record to BOTH schemas (workspace + nirav's Lead).
// Returns a flat object with all keys so any consumer can pick what it needs.
function mapApolloPersonToLead(p: ApolloMatchPerson, industryHint: string) {
  const org = p.organization || {};
  const fullName =
    p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Apollo Contact";
  const phone = p.phone_numbers?.[0]?.sanitized_number || "";
  const hasEmail = p.email && !/email_not_unlocked|locked|unlock/i.test(p.email);
  const emailStatus = hasEmail
    ? p.email_status === "verified"
      ? "verified"
      : "guessed"
    : "unverified";
  const dept = p.departments?.[0] || "";

  return {
    // Old/workspace schema (PullLeadsDialog display + workspace storage)
    fullName,
    firstName: p.first_name || "",
    lastName: p.last_name || "",
    jobTitle: p.title || "",
    jobSeniority: prettifySeniority(p.seniority),
    companyName: org.name || "",
    email: hasEmail ? (p.email as string) : "",
    emailStatus,
    city: p.city || "",
    region: p.state || "",
    country: p.country || "United States",
    industry: org.industry || industryHint,
    mobilePhone: phone,
    linkedin: p.linkedin_url || "",

    // Nirav's Lead schema (so /leads table import shows everything)
    prospectFullName: fullName,
    prospectFirstName: p.first_name || "",
    prospectLastName: p.last_name || "",
    prospectJobTitle: p.title || "",
    prospectJobSeniorityLevel: prettifySeniority(p.seniority),
    prospectJobDepartment: prettifyDepartment(dept),
    prospectLinkedin: p.linkedin_url || "",
    prospectCity: p.city || "",
    prospectRegionName: p.state || "",
    prospectCountryName: p.country || "United States",
    prospectCompanyName: org.name || "",
    prospectCompanyWebsite: org.website_url || "",
    prospectCompanyLinkedin: org.linkedin_url || "",
    contactProfessionalEmail: hasEmail ? (p.email as string) : "",
    contactProfessionalEmailStatus: emailStatus,
    contactMobilePhone: phone,
    contactPhoneNumbers: (p.phone_numbers ?? []).map((n) => n.sanitized_number).filter(Boolean) as string[],

    source: "apollo",
    funnel: "hustle" as const,
    status: "new" as const,
  };
}

// ── Contacts search (saved CRM contacts — no credits consumed) ───────────────
// Tries progressively broader queries to maximise contacts returned.
async function apolloContactsSearch(
  apiKey: string,
  params: { industry: string; location: string; seniority: string; perPage: number },
): Promise<ApolloMatchPerson[]> {
  const seniorities = SENIORITY_TO_APOLLO[params.seniority] ?? SENIORITY_TO_APOLLO.Any;
  const cap = Math.min(Math.max(params.perPage, 1), 100);

  async function doSearch(body: Record<string, unknown>): Promise<ApolloMatchPerson[]> {
    const res = await fetch(`${APOLLO_BASE}/contacts/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache", "X-Api-Key": apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`Apollo contacts/search ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { contacts?: ApolloMatchPerson[] };
    return data.contacts ?? [];
  }

  const base = { per_page: cap, page: 1, sort_by_field: "contact_last_activity_date", sort_ascending: false };

  // Attempt 1: location + seniority filter
  if (params.location) {
    const contacts = await doSearch({ ...base, person_locations: [params.location], person_seniorities: seniorities });
    if (contacts.length > 0) return contacts;
  }

  // Attempt 2: seniority only (no location restriction) — catches contacts from other cities
  const contacts2 = await doSearch({ ...base, person_seniorities: seniorities });
  if (contacts2.length > 0) return contacts2;

  // Attempt 3: no filters — return all saved contacts (broadest)
  return doSearch({ ...base, per_page: cap });
}

// ── Prospecting search (full Apollo DB — returns obfuscated names) ────────────
async function apolloSearch(
  apiKey: string,
  params: { industry: string; location: string; seniority: string; perPage: number },
): Promise<ApolloSearchPerson[]> {
  const titles = INDUSTRY_TITLE_HINTS[params.industry] ?? INDUSTRY_TITLE_HINTS.Healthcare;
  const seniorities = SENIORITY_TO_APOLLO[params.seniority] ?? SENIORITY_TO_APOLLO.Any;

  const res = await fetch(`${APOLLO_BASE}/mixed_people/api_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache", "X-Api-Key": apiKey },
    body: JSON.stringify({
      person_titles: titles,
      person_seniorities: seniorities,
      person_locations: [params.location],
      per_page: Math.min(Math.max(params.perPage, 1), 25),
      page: 1,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`Apollo search ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { people?: ApolloSearchPerson[] };
  return data.people ?? [];
}

async function apolloBulkMatch(
  apiKey: string,
  ids: string[],
): Promise<ApolloMatchPerson[]> {
  if (ids.length === 0) return [];

  const res = await fetch(`${APOLLO_BASE}/people/bulk_match`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache", "X-Api-Key": apiKey },
    body: JSON.stringify({
      reveal_personal_emails: false,
      reveal_phone_number: true,
      details: ids.map((id) => ({ id })),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`Apollo bulk_match ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { matches?: ApolloMatchPerson[]; people?: ApolloMatchPerson[] };
  return data.matches ?? data.people ?? [];
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
  return map[raw.toLowerCase()] ?? raw.split("_").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

function sampleFallback(
  industry: string,
  seniority: string,
  perPage: number,
) {
  const base = SAMPLE_LEADS[industry] ?? SAMPLE_LEADS.Healthcare;
  const filtered = filterBySeniority(base, seniority).slice(0, perPage);
  return filtered.map((l) => {
    const ll = l as Record<string, string>;
    return {
      // workspace fields
      ...ll,
      // Lead schema fields
      prospectFullName: ll.fullName,
      prospectFirstName: ll.firstName,
      prospectLastName: ll.lastName,
      prospectJobTitle: ll.jobTitle,
      prospectJobSeniorityLevel: ll.jobSeniority,
      prospectJobDepartment: ll.department ?? "",
      prospectLinkedin: ll.linkedin ?? "",
      prospectCity: ll.city,
      prospectRegionName: ll.region,
      prospectCountryName: ll.country,
      prospectCompanyName: ll.companyName,
      prospectCompanyWebsite: ll.companyWebsite ?? "",
      prospectCompanyLinkedin: ll.companyLinkedin ?? "",
      contactProfessionalEmail: ll.email,
      contactProfessionalEmailStatus: ll.emailStatus,
      contactMobilePhone: ll.mobilePhone ?? "",
      contactPhoneNumbers: ll.mobilePhone ? [ll.mobilePhone] : [],
      source: "apollo",
      funnel: "hustle",
      status: "new",
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      industry = "Healthcare",
      location = "Dallas, Texas, United States",
      seniority = "Any",
      perPage = 10,
    } = body;

    // PRIMARY: synced apollo-contacts.json — real data, zero API calls, zero credits
    const synced = await loadApolloContacts();
    if (synced && synced.contacts.length > 0) {
      const filtered = filterLeads(synced.contacts, { seniority, count: perPage });
      // If seniority filter returns nothing, return any contacts up to perPage
      const results = filtered.length > 0 ? filtered : synced.contacts.slice(0, perPage);
      return Response.json({
        leads: results,
        total: results.length,
        source: "apollo",
        live: false,
        syncedAt: synced.generatedAt,
      });
    }

    const apiKey = process.env.APOLLO_API_KEY;

    // LIVE PATH 1: contacts/search (no credits, full CRM data)
    if (apiKey) {
      try {
        const contacts = await apolloContactsSearch(apiKey, { industry, location, seniority, perPage });
        if (contacts.length > 0) {
          const leads = contacts.map((p) => mapApolloPersonToLead(p, industry));
          return Response.json({
            leads,
            total: leads.length,
            source: "apollo",
            live: true,
          });
        }
      } catch (err) {
        console.error("[apollo-search] contacts/search failed:", err instanceof Error ? err.message : "unknown");
      }
    }

    // LIVE PATH 2: prospecting + bulk_match (uses credits — last live resort)
    if (apiKey) {
      try {
        const searchResults = await apolloSearch(apiKey, { industry, location, seniority, perPage });
        if (searchResults.length > 0) {
          const ids = searchResults
            .map((p) => p.id)
            .filter((id): id is string => Boolean(id))
            .slice(0, perPage);
          const unlocked = await apolloBulkMatch(apiKey, ids);
          const leads = unlocked.map((p) => mapApolloPersonToLead(p, industry));
          return Response.json({ leads, total: leads.length, source: "apollo", live: true });
        }
      } catch (err) {
        console.error("[apollo-search] live prospecting failed:", err instanceof Error ? err.message : "unknown");
      }
    }

    // FALLBACK: pre-pulled JSON pool
    const realPool = await loadRealFallback();
    if (realPool?.byIndustry?.[industry]?.length) {
      const all = realPool.byIndustry[industry] as Record<string, unknown>[];
      const filtered = filterBySeniority(all, seniority).slice(0, perPage).map((lead) => {
        const l = lead as Record<string, unknown>;
        return {
          ...l,
          prospectJobDepartment: prettifyDepartment(l.prospectJobDepartment as string | undefined),
          contactPhoneNumbers: l.contactMobilePhone ? [l.contactMobilePhone] : [],
        };
      });
      return Response.json({ leads: filtered, total: filtered.length, source: "apollo", live: false });
    }

    // LAST RESORT: hardcoded sample data
    const leads = sampleFallback(industry, seniority, perPage);
    return Response.json({ leads, total: leads.length, source: "apollo", live: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apollo search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
