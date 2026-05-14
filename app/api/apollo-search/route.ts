import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SAMPLE_LEADS: Record<string, object[]> = {
  Healthcare: [
    { fullName: "Dr. Karen Mitchell", firstName: "Karen", lastName: "Mitchell", jobTitle: "Chief Medical Officer", jobSeniority: "C-Suite", companyName: "Baylor Scott & White", email: "k.mitchell@bswhealth.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Thomas Grant", firstName: "Thomas", lastName: "Grant", jobTitle: "VP of Hospital Operations", jobSeniority: "VP", companyName: "Medical City Healthcare", email: "t.grant@medcity.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Angela Peters", firstName: "Angela", lastName: "Peters", jobTitle: "Director of Nursing Education", jobSeniority: "Director", companyName: "Parkland Health", email: "a.peters@parkland.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Raymond Cruz", firstName: "Raymond", lastName: "Cruz", jobTitle: "Residency Program Director", jobSeniority: "Director", companyName: "UT Southwestern", email: "r.cruz@utsw.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Michelle Foster", firstName: "Michelle", lastName: "Foster", jobTitle: "VP of Partnerships", jobSeniority: "VP", companyName: "Children's Health", email: "m.foster@childrens.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Eric Washington", firstName: "Eric", lastName: "Washington", jobTitle: "Regional Travel Coordinator", jobSeniority: "Manager", companyName: "HCA Healthcare North Texas", email: "e.washington@hca.com", emailStatus: "verified", city: "Irving", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Sandra Kim", firstName: "Sandra", lastName: "Kim", jobTitle: "Procurement Manager", jobSeniority: "Manager", companyName: "Texas Health Resources", email: "s.kim@txhealth.org", emailStatus: "verified", city: "Arlington", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Carlos Gutierrez", firstName: "Carlos", lastName: "Gutierrez", jobTitle: "Director of CME Programs", jobSeniority: "Director", companyName: "Methodist Health System", email: "c.gutierrez@mhd.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
  ],
  Technology: [
    { fullName: "Ryan Chen", firstName: "Ryan", lastName: "Chen", jobTitle: "VP of Engineering", jobSeniority: "VP", companyName: "AT&T", email: "r.chen@att.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Jessica Moore", firstName: "Jessica", lastName: "Moore", jobTitle: "Director of Talent Acquisition", jobSeniority: "Director", companyName: "Texas Instruments", email: "j.moore@ti.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
    { fullName: "David Park", firstName: "David", lastName: "Park", jobTitle: "CTO", jobSeniority: "C-Suite", companyName: "Match Group", email: "d.park@match.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Lauren Brooks", firstName: "Lauren", lastName: "Brooks", jobTitle: "Sr. Program Manager", jobSeniority: "Manager", companyName: "Salesforce DFW", email: "l.brooks@salesforce.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Mark Anderson", firstName: "Mark", lastName: "Anderson", jobTitle: "VP Corporate Events", jobSeniority: "VP", companyName: "Cisco Systems", email: "m.anderson@cisco.com", emailStatus: "verified", city: "Richardson", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Priya Nair", firstName: "Priya", lastName: "Nair", jobTitle: "Director of Sales Enablement", jobSeniority: "Director", companyName: "Oracle", email: "p.nair@oracle.com", emailStatus: "verified", city: "Austin", region: "TX", country: "US", industry: "Technology" },
  ],
  Construction: [
    { fullName: "Robert Wilson", firstName: "Robert", lastName: "Wilson", jobTitle: "VP of Field Operations", jobSeniority: "VP", companyName: "Balfour Beatty", email: "r.wilson@balfourbeatty.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
    { fullName: "Maria Lopez", firstName: "Maria", lastName: "Lopez", jobTitle: "Project Director", jobSeniority: "Director", companyName: "Austin Industries", email: "m.lopez@austin-ind.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
    { fullName: "James Turner", firstName: "James", lastName: "Turner", jobTitle: "Site Manager", jobSeniority: "Manager", companyName: "McCarthy Building", email: "j.turner@mccarthy.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
    { fullName: "Sarah Campbell", firstName: "Sarah", lastName: "Campbell", jobTitle: "HR Director", jobSeniority: "Director", companyName: "Kiewit Corporation", email: "s.campbell@kiewit.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Construction" },
    { fullName: "Brian Harris", firstName: "Brian", lastName: "Harris", jobTitle: "Regional Manager", jobSeniority: "Manager", companyName: "Turner Construction", email: "b.harris@tcco.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
  ],
  Finance: [
    { fullName: "Laura Bennett", firstName: "Laura", lastName: "Bennett", jobTitle: "Managing Director", jobSeniority: "C-Suite", companyName: "Goldman Sachs Dallas", email: "l.bennett@gs.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Finance" },
    { fullName: "Michael Torres", firstName: "Michael", lastName: "Torres", jobTitle: "VP of Corporate Banking", jobSeniority: "VP", companyName: "JP Morgan Chase", email: "m.torres@jpmorgan.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Finance" },
    { fullName: "Rebecca Owens", firstName: "Rebecca", lastName: "Owens", jobTitle: "Director of Compliance", jobSeniority: "Director", companyName: "Bank of America", email: "r.owens@bofa.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Finance" },
    { fullName: "Jonathan Reeves", firstName: "Jonathan", lastName: "Reeves", jobTitle: "CFO", jobSeniority: "C-Suite", companyName: "Southwest Securities", email: "j.reeves@swsec.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Finance" },
  ],
  Defense: [
    { fullName: "Col. James Porter (Ret.)", firstName: "James", lastName: "Porter", jobTitle: "VP of Government Affairs", jobSeniority: "VP", companyName: "Lockheed Martin", email: "j.porter@lmco.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Defense" },
    { fullName: "Diana Holloway", firstName: "Diana", lastName: "Holloway", jobTitle: "Director of Training Programs", jobSeniority: "Director", companyName: "L3Harris Technologies", email: "d.holloway@l3harris.com", emailStatus: "verified", city: "Arlington", region: "TX", country: "US", industry: "Defense" },
    { fullName: "Steven Park", firstName: "Steven", lastName: "Park", jobTitle: "Program Manager", jobSeniority: "Manager", companyName: "Raytheon", email: "s.park@raytheon.com", emailStatus: "guessed", city: "McKinney", region: "TX", country: "US", industry: "Defense" },
  ],
  Education: [
    { fullName: "Dr. Patricia Williams", firstName: "Patricia", lastName: "Williams", jobTitle: "Dean of Business School", jobSeniority: "C-Suite", companyName: "SMU", email: "p.williams@smu.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Education" },
    { fullName: "Gregory Chang", firstName: "Gregory", lastName: "Chang", jobTitle: "VP of Student Affairs", jobSeniority: "VP", companyName: "UT Dallas", email: "g.chang@utdallas.edu", emailStatus: "verified", city: "Richardson", region: "TX", country: "US", industry: "Education" },
    { fullName: "Amanda Ellis", firstName: "Amanda", lastName: "Ellis", jobTitle: "Director of Continuing Education", jobSeniority: "Director", companyName: "Collin College", email: "a.ellis@collin.edu", emailStatus: "guessed", city: "Plano", region: "TX", country: "US", industry: "Education" },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { industry = "Healthcare", location, seniority } = body;

    await new Promise((r) => setTimeout(r, 1500));

    const base = SAMPLE_LEADS[industry] ?? SAMPLE_LEADS.Healthcare;
    const filtered = filterBySeniority(base, seniority as string);
    const leads = filtered.map((l) => ({ ...l, source: "apollo", funnel: "hustle", status: "new" }));

    return Response.json({ leads, total: leads.length, source: "apollo" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apollo search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
