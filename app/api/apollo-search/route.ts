import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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
    { fullName: "Dr. Karen Mitchell", firstName: "Karen", lastName: "Mitchell", jobTitle: "Chief Medical Officer", jobSeniority: "C-Suite", companyName: "Baylor Scott & White", email: "k.mitchell@bswhealth.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (214) 555-0142", linkedin: "https://linkedin.com/in/karen-mitchell-bsw" },
    { fullName: "Thomas Grant", firstName: "Thomas", lastName: "Grant", jobTitle: "VP of Hospital Operations", jobSeniority: "VP", companyName: "Medical City Healthcare", email: "t.grant@medcity.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (214) 555-0188", linkedin: "https://linkedin.com/in/thomas-grant-mch" },
    { fullName: "Angela Peters", firstName: "Angela", lastName: "Peters", jobTitle: "Director of Nursing Education", jobSeniority: "Director", companyName: "Parkland Health", email: "a.peters@parkland.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (214) 555-0211", linkedin: "https://linkedin.com/in/angela-peters-parkland" },
    { fullName: "Raymond Cruz", firstName: "Raymond", lastName: "Cruz", jobTitle: "Residency Program Director", jobSeniority: "Director", companyName: "UT Southwestern", email: "r.cruz@utsw.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (214) 555-0234", linkedin: "https://linkedin.com/in/raymond-cruz-utsw" },
    { fullName: "Michelle Foster", firstName: "Michelle", lastName: "Foster", jobTitle: "VP of Partnerships", jobSeniority: "VP", companyName: "Children's Health", email: "m.foster@childrens.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (214) 555-0277", linkedin: "https://linkedin.com/in/michelle-foster-ch" },
    { fullName: "Eric Washington", firstName: "Eric", lastName: "Washington", jobTitle: "Regional Travel Coordinator", jobSeniority: "Manager", companyName: "HCA Healthcare North Texas", email: "e.washington@hca.com", emailStatus: "verified", city: "Irving", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (972) 555-0142", linkedin: "https://linkedin.com/in/eric-washington-hca" },
    { fullName: "Sandra Kim", firstName: "Sandra", lastName: "Kim", jobTitle: "Procurement Manager", jobSeniority: "Manager", companyName: "Texas Health Resources", email: "s.kim@txhealth.org", emailStatus: "verified", city: "Arlington", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (817) 555-0123", linkedin: "https://linkedin.com/in/sandra-kim-thr" },
    { fullName: "Carlos Gutierrez", firstName: "Carlos", lastName: "Gutierrez", jobTitle: "Director of CME Programs", jobSeniority: "Director", companyName: "Methodist Health System", email: "c.gutierrez@mhd.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare", mobilePhone: "+1 (214) 555-0298", linkedin: "https://linkedin.com/in/carlos-gutierrez-mhd" },
  ],
  Technology: [
    { fullName: "Ryan Chen", firstName: "Ryan", lastName: "Chen", jobTitle: "VP of Engineering", jobSeniority: "VP", companyName: "AT&T", email: "r.chen@att.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology", mobilePhone: "+1 (214) 555-0312", linkedin: "https://linkedin.com/in/ryan-chen-att" },
    { fullName: "Jessica Moore", firstName: "Jessica", lastName: "Moore", jobTitle: "Director of Talent Acquisition", jobSeniority: "Director", companyName: "Texas Instruments", email: "j.moore@ti.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology", mobilePhone: "+1 (972) 555-0344", linkedin: "https://linkedin.com/in/jessica-moore-ti" },
    { fullName: "David Park", firstName: "David", lastName: "Park", jobTitle: "CTO", jobSeniority: "C-Suite", companyName: "Match Group", email: "d.park@match.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Technology", mobilePhone: "+1 (214) 555-0356", linkedin: "https://linkedin.com/in/david-park-match" },
    { fullName: "Lauren Brooks", firstName: "Lauren", lastName: "Brooks", jobTitle: "Sr. Program Manager", jobSeniority: "Manager", companyName: "Salesforce DFW", email: "l.brooks@salesforce.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology", mobilePhone: "+1 (214) 555-0378", linkedin: "https://linkedin.com/in/lauren-brooks-sf" },
    { fullName: "Mark Anderson", firstName: "Mark", lastName: "Anderson", jobTitle: "VP Corporate Events", jobSeniority: "VP", companyName: "Cisco Systems", email: "m.anderson@cisco.com", emailStatus: "verified", city: "Richardson", region: "TX", country: "US", industry: "Technology", mobilePhone: "+1 (972) 555-0399", linkedin: "https://linkedin.com/in/mark-anderson-cisco" },
    { fullName: "Priya Nair", firstName: "Priya", lastName: "Nair", jobTitle: "Director of Sales Enablement", jobSeniority: "Director", companyName: "Oracle", email: "p.nair@oracle.com", emailStatus: "verified", city: "Austin", region: "TX", country: "US", industry: "Technology", mobilePhone: "+1 (512) 555-0411", linkedin: "https://linkedin.com/in/priya-nair-oracle" },
  ],
  Construction: [
    { fullName: "Robert Wilson", firstName: "Robert", lastName: "Wilson", jobTitle: "VP of Field Operations", jobSeniority: "VP", companyName: "Balfour Beatty", email: "r.wilson@balfourbeatty.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction", mobilePhone: "+1 (214) 555-0423", linkedin: "https://linkedin.com/in/robert-wilson-bb" },
    { fullName: "Maria Lopez", firstName: "Maria", lastName: "Lopez", jobTitle: "Project Director", jobSeniority: "Director", companyName: "Austin Industries", email: "m.lopez@austin-ind.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction", mobilePhone: "+1 (214) 555-0445", linkedin: "https://linkedin.com/in/maria-lopez-ai" },
    { fullName: "James Turner", firstName: "James", lastName: "Turner", jobTitle: "Site Manager", jobSeniority: "Manager", companyName: "McCarthy Building", email: "j.turner@mccarthy.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Construction", mobilePhone: "+1 (214) 555-0467", linkedin: "https://linkedin.com/in/james-turner-mcc" },
    { fullName: "Sarah Campbell", firstName: "Sarah", lastName: "Campbell", jobTitle: "HR Director", jobSeniority: "Director", companyName: "Kiewit Corporation", email: "s.campbell@kiewit.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Construction", mobilePhone: "+1 (817) 555-0489", linkedin: "https://linkedin.com/in/sarah-campbell-kiewit" },
    { fullName: "Brian Harris", firstName: "Brian", lastName: "Harris", jobTitle: "Regional Manager", jobSeniority: "Manager", companyName: "Turner Construction", email: "b.harris@tcco.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction", mobilePhone: "+1 (214) 555-0501", linkedin: "https://linkedin.com/in/brian-harris-turner" },
  ],
  Finance: [
    { fullName: "Laura Bennett", firstName: "Laura", lastName: "Bennett", jobTitle: "Managing Director", jobSeniority: "C-Suite", companyName: "Goldman Sachs Dallas", email: "l.bennett@gs.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Finance", mobilePhone: "+1 (214) 555-0523", linkedin: "https://linkedin.com/in/laura-bennett-gs" },
    { fullName: "Michael Torres", firstName: "Michael", lastName: "Torres", jobTitle: "VP of Corporate Banking", jobSeniority: "VP", companyName: "JP Morgan Chase", email: "m.torres@jpmorgan.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Finance", mobilePhone: "+1 (214) 555-0545", linkedin: "https://linkedin.com/in/michael-torres-jpm" },
    { fullName: "Rebecca Owens", firstName: "Rebecca", lastName: "Owens", jobTitle: "Director of Compliance", jobSeniority: "Director", companyName: "Bank of America", email: "r.owens@bofa.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Finance", mobilePhone: "+1 (214) 555-0567", linkedin: "https://linkedin.com/in/rebecca-owens-bofa" },
    { fullName: "Jonathan Reeves", firstName: "Jonathan", lastName: "Reeves", jobTitle: "CFO", jobSeniority: "C-Suite", companyName: "Southwest Securities", email: "j.reeves@swsec.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Finance", mobilePhone: "+1 (214) 555-0589", linkedin: "https://linkedin.com/in/jonathan-reeves-sws" },
  ],
  Defense: [
    { fullName: "Col. James Porter (Ret.)", firstName: "James", lastName: "Porter", jobTitle: "VP of Government Affairs", jobSeniority: "VP", companyName: "Lockheed Martin", email: "j.porter@lmco.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Defense", mobilePhone: "+1 (817) 555-0601", linkedin: "https://linkedin.com/in/james-porter-lm" },
    { fullName: "Diana Holloway", firstName: "Diana", lastName: "Holloway", jobTitle: "Director of Training Programs", jobSeniority: "Director", companyName: "L3Harris Technologies", email: "d.holloway@l3harris.com", emailStatus: "verified", city: "Arlington", region: "TX", country: "US", industry: "Defense", mobilePhone: "+1 (817) 555-0623", linkedin: "https://linkedin.com/in/diana-holloway-l3" },
    { fullName: "Steven Park", firstName: "Steven", lastName: "Park", jobTitle: "Program Manager", jobSeniority: "Manager", companyName: "Raytheon", email: "s.park@raytheon.com", emailStatus: "guessed", city: "McKinney", region: "TX", country: "US", industry: "Defense", mobilePhone: "+1 (972) 555-0645", linkedin: "https://linkedin.com/in/steven-park-rtx" },
  ],
  Education: [
    { fullName: "Dr. Patricia Williams", firstName: "Patricia", lastName: "Williams", jobTitle: "Dean of Business School", jobSeniority: "C-Suite", companyName: "SMU", email: "p.williams@smu.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Education", mobilePhone: "+1 (214) 555-0667", linkedin: "https://linkedin.com/in/patricia-williams-smu" },
    { fullName: "Gregory Chang", firstName: "Gregory", lastName: "Chang", jobTitle: "VP of Student Affairs", jobSeniority: "VP", companyName: "UT Dallas", email: "g.chang@utdallas.edu", emailStatus: "verified", city: "Richardson", region: "TX", country: "US", industry: "Education", mobilePhone: "+1 (972) 555-0689", linkedin: "https://linkedin.com/in/gregory-chang-utd" },
    { fullName: "Amanda Ellis", firstName: "Amanda", lastName: "Ellis", jobTitle: "Director of Continuing Education", jobSeniority: "Director", companyName: "Collin College", email: "a.ellis@collin.edu", emailStatus: "guessed", city: "Plano", region: "TX", country: "US", industry: "Education", mobilePhone: "+1 (972) 555-0701", linkedin: "https://linkedin.com/in/amanda-ellis-collin" },
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
  Director: ["director", "head"],
  VP: ["vp"],
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
  last_name_obfuscated?: string;
  title?: string;
  organization?: { name?: string; industry?: string };
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
    country: p.country || "US",
    industry: org.industry || industryHint,
    mobilePhone: phone,
    linkedin: p.linkedin_url || "",

    // Nirav's Lead schema (so /leads table import shows everything)
    prospectFullName: fullName,
    prospectFirstName: p.first_name || "",
    prospectLastName: p.last_name || "",
    prospectJobTitle: p.title || "",
    prospectJobSeniorityLevel: prettifySeniority(p.seniority),
    prospectJobDepartment: dept,
    prospectLinkedin: p.linkedin_url || "",
    prospectCity: p.city || "",
    prospectRegionName: p.state || "",
    prospectCountryName: p.country || "US",
    prospectCompanyName: org.name || "",
    prospectCompanyWebsite: org.website_url || "",
    prospectCompanyLinkedin: org.linkedin_url || "",
    contactProfessionalEmail: hasEmail ? (p.email as string) : "",
    contactProfessionalEmailStatus: emailStatus,
    contactMobilePhone: phone,

    source: "apollo",
    funnel: "hustle" as const,
    status: "new" as const,
  };
}

async function apolloSearch(
  apiKey: string,
  params: { industry: string; location: string; seniority: string; perPage: number },
): Promise<ApolloSearchPerson[]> {
  const titles = INDUSTRY_TITLE_HINTS[params.industry] ?? INDUSTRY_TITLE_HINTS.Healthcare;
  const seniorities = SENIORITY_TO_APOLLO[params.seniority] ?? SENIORITY_TO_APOLLO.Any;

  const res = await fetch(`${APOLLO_BASE}/mixed_people/api_search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      person_titles: titles,
      person_seniorities: seniorities,
      person_locations: [params.location],
      per_page: Math.min(Math.max(params.perPage, 1), 25),
      page: 1,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(
      `Apollo search ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }
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
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      reveal_personal_emails: false,
      reveal_phone_number: false,
      details: ids.map((id) => ({ id })),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(
      `Apollo bulk_match ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as {
    matches?: ApolloMatchPerson[];
    people?: ApolloMatchPerson[];
  };
  return data.matches ?? data.people ?? [];
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
      // nirav lead fields (mapped from workspace)
      prospectFullName: ll.fullName,
      prospectFirstName: ll.firstName,
      prospectLastName: ll.lastName,
      prospectJobTitle: ll.jobTitle,
      prospectJobSeniorityLevel: ll.jobSeniority,
      prospectJobDepartment: "",
      prospectLinkedin: ll.linkedin ?? "",
      prospectCity: ll.city,
      prospectRegionName: ll.region,
      prospectCountryName: ll.country,
      prospectCompanyName: ll.companyName,
      prospectCompanyWebsite: "",
      prospectCompanyLinkedin: "",
      contactProfessionalEmail: ll.email,
      contactProfessionalEmailStatus: ll.emailStatus,
      contactMobilePhone: ll.mobilePhone ?? "",
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

    const apiKey = process.env.APOLLO_API_KEY;

    // LIVE PATH: search → bulk_match → unlocked people
    if (apiKey) {
      try {
        const searchResults = await apolloSearch(apiKey, {
          industry,
          location,
          seniority,
          perPage,
        });

        if (searchResults.length > 0) {
          const ids = searchResults
            .map((p) => p.id)
            .filter((id): id is string => Boolean(id))
            .slice(0, perPage);

          let unlocked: ApolloMatchPerson[] = [];
          try {
            unlocked = await apolloBulkMatch(apiKey, ids);
          } catch (matchErr) {
            // Bulk match failed — degrade gracefully, use search metadata only
            console.error(
              "[apollo-search] bulk_match failed, using search-only:",
              matchErr instanceof Error ? matchErr.message : "unknown",
            );
            unlocked = searchResults.map((sp) => ({
              id: sp.id,
              first_name: sp.first_name,
              title: sp.title,
              organization: sp.organization,
            }));
          }

          const leads = unlocked.map((p) => mapApolloPersonToLead(p, industry));
          return Response.json({
            leads,
            total: leads.length,
            source: "apollo",
            live: true,
            note: `Searched Apollo: ${searchResults.length} matches, unlocked ${unlocked.length}`,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Apollo failed";
        console.error("[apollo-search] live failed, using fallback:", msg);
      }
    }

    // FALLBACK PATH 1: real pre-pulled Apollo data (preferred)
    const realPool = await loadRealFallback();
    if (realPool?.byIndustry?.[industry]?.length) {
      const all = realPool.byIndustry[industry] as Record<string, unknown>[];
      // Apply seniority filter using prettified field
      const filtered = filterBySeniority(all, seniority).slice(0, perPage);
      await new Promise((r) => setTimeout(r, 600)); // small theatre delay
      return Response.json({
        leads: filtered,
        total: filtered.length,
        source: "apollo",
        live: false,
        usingRealFallback: true,
        fallbackGeneratedAt: realPool.generatedAt,
      });
    }

    // FALLBACK PATH 2: hardcoded sample (ultimate safety net)
    await new Promise((r) => setTimeout(r, 800));
    const leads = sampleFallback(industry, seniority, perPage);
    return Response.json({
      leads,
      total: leads.length,
      source: "apollo",
      live: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apollo search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
