import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SAMPLE_LEADS: Record<string, object[]> = {
  Healthcare: [
    { fullName: "Dr. Aisha Patel", firstName: "Aisha", lastName: "Patel", jobTitle: "Chief of Staff Services", jobSeniority: "C-Suite", companyName: "Southwestern Medical Foundation", email: "a.patel@swmedical.org", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Marcus Webb", firstName: "Marcus", lastName: "Webb", jobTitle: "VP of Clinical Operations", jobSeniority: "VP", companyName: "CHRISTUS Health", email: "m.webb@christushealth.org", emailStatus: "verified", city: "Irving", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Vanessa Hollins", firstName: "Vanessa", lastName: "Hollins", jobTitle: "Director of Group Travel", jobSeniority: "Director", companyName: "North Texas Heart Center", email: "v.hollins@ntheart.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Kenneth Shaw", firstName: "Kenneth", lastName: "Shaw", jobTitle: "Hospital Administrator", jobSeniority: "C-Suite", companyName: "VA North Texas Health Care", email: "k.shaw@va.gov", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Natalie Brooks", firstName: "Natalie", lastName: "Brooks", jobTitle: "Director of Medical Education", jobSeniority: "Director", companyName: "UT Health", email: "n.brooks@uthealth.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Derek Manning", firstName: "Derek", lastName: "Manning", jobTitle: "VP of Operations", jobSeniority: "VP", companyName: "Baylor Scott & White Research Institute", email: "d.manning@bswri.org", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    { fullName: "Christine Yao", firstName: "Christine", lastName: "Yao", jobTitle: "Corporate Procurement Director", jobSeniority: "Director", companyName: "Tenet Healthcare", email: "c.yao@tenethealth.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
  ],
  Technology: [
    { fullName: "Andrew Kim", firstName: "Andrew", lastName: "Kim", jobTitle: "VP of Product", jobSeniority: "VP", companyName: "Dialexa", email: "a.kim@dialexa.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Rachel Stone", firstName: "Rachel", lastName: "Stone", jobTitle: "Director of People Ops", jobSeniority: "Director", companyName: "Perot Museum of Nature & Science", email: "r.stone@perotmuseum.org", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Chris Nguyen", firstName: "Chris", lastName: "Nguyen", jobTitle: "CTO", jobSeniority: "C-Suite", companyName: "Toptal", email: "c.nguyen@toptal.com", emailStatus: "verified", city: "Austin", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Megan Sullivan", firstName: "Megan", lastName: "Sullivan", jobTitle: "VP of Customer Success", jobSeniority: "VP", companyName: "Sendoso", email: "m.sullivan@sendoso.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
    { fullName: "Brian Foster", firstName: "Brian", lastName: "Foster", jobTitle: "Director of IT", jobSeniority: "Director", companyName: "Fossil Group", email: "b.foster@fossil.com", emailStatus: "guessed", city: "Richardson", region: "TX", country: "US", industry: "Technology" },
  ],
  Construction: [
    { fullName: "Patrick Jordan", firstName: "Patrick", lastName: "Jordan", jobTitle: "VP of Business Development", jobSeniority: "VP", companyName: "Skanska USA", email: "p.jordan@skanska.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
    { fullName: "Lisa Hammond", firstName: "Lisa", lastName: "Hammond", jobTitle: "Director of HSE", jobSeniority: "Director", companyName: "Jacobs Engineering", email: "l.hammond@jacobs.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
    { fullName: "Kevin Ortiz", firstName: "Kevin", lastName: "Ortiz", jobTitle: "Project Executive", jobSeniority: "VP", companyName: "Hensel Phelps", email: "k.ortiz@henselphelps.com", emailStatus: "guessed", city: "Fort Worth", region: "TX", country: "US", industry: "Construction" },
    { fullName: "Diane Russell", firstName: "Diane", lastName: "Russell", jobTitle: "HR Manager", jobSeniority: "Manager", companyName: "Kitchell Corporation", email: "d.russell@kitchell.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
  ],
  Finance: [
    { fullName: "Victor Chang", firstName: "Victor", lastName: "Chang", jobTitle: "Managing Partner", jobSeniority: "C-Suite", companyName: "Hillwood Capital", email: "v.chang@hillwood.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Finance" },
    { fullName: "Susan Blake", firstName: "Susan", lastName: "Blake", jobTitle: "VP of Private Wealth", jobSeniority: "VP", companyName: "Comerica Bank", email: "s.blake@comerica.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Finance" },
    { fullName: "Nathan Cross", firstName: "Nathan", lastName: "Cross", jobTitle: "Director of Risk Management", jobSeniority: "Director", companyName: "Fidelity Investments", email: "n.cross@fidelity.com", emailStatus: "guessed", city: "Westlake", region: "TX", country: "US", industry: "Finance" },
  ],
  Defense: [
    { fullName: "Brig. Gen. Rita Morales (Ret.)", firstName: "Rita", lastName: "Morales", jobTitle: "VP of Defense Programs", jobSeniority: "VP", companyName: "General Dynamics", email: "r.morales@gd.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Defense" },
    { fullName: "Christopher Holt", firstName: "Christopher", lastName: "Holt", jobTitle: "Director of Contracts", jobSeniority: "Director", companyName: "Bell Textron", email: "c.holt@bellflight.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Defense" },
  ],
  Education: [
    { fullName: "Dr. Samuel Okafor", firstName: "Samuel", lastName: "Okafor", jobTitle: "Provost", jobSeniority: "C-Suite", companyName: "Texas Christian University", email: "s.okafor@tcu.edu", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Education" },
    { fullName: "Heather Daniels", firstName: "Heather", lastName: "Daniels", jobTitle: "Director of Alumni Relations", jobSeniority: "Director", companyName: "UNT", email: "h.daniels@unt.edu", emailStatus: "guessed", city: "Denton", region: "TX", country: "US", industry: "Education" },
    { fullName: "Marcus Lee", firstName: "Marcus", lastName: "Lee", jobTitle: "VP of External Affairs", jobSeniority: "VP", companyName: "Texas A&M Commerce", email: "m.lee@tamuc.edu", emailStatus: "verified", city: "Commerce", region: "TX", country: "US", industry: "Education" },
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

    await new Promise((r) => setTimeout(r, 1200));

    const base = SAMPLE_LEADS[industry] ?? SAMPLE_LEADS.Healthcare;
    const filtered = filterBySeniority(base, seniority as string);
    const leads = filtered.map((l) => ({ ...l, source: "vibe", funnel: "hustle", status: "new" }));

    return Response.json({ leads, total: leads.length, source: "vibe" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vibe search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
