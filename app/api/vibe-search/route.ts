import { NextRequest } from "next/server";

export const runtime = "nodejs";

type VibeLeadRaw = {
  fullName: string; firstName: string; lastName: string;
  jobTitle: string; jobSeniority: string; department: string;
  companyName: string; companyWebsite: string; companyLinkedin: string;
  email: string; emailStatus: string;
  city: string; region: string; country: string; industry: string;
  mobilePhone: string; linkedin: string;
};

const SAMPLE_LEADS: Record<string, VibeLeadRaw[]> = {
  Healthcare: [
    { fullName: "Dr. Aisha Patel", firstName: "Aisha", lastName: "Patel", jobTitle: "Chief of Staff Services", jobSeniority: "C-Suite", department: "Medical Leadership", companyName: "Southwestern Medical Foundation", companyWebsite: "https://www.swmedical.org", companyLinkedin: "https://www.linkedin.com/company/southwestern-medical-foundation", email: "a.patel@swmedical.org", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0191", linkedin: "https://www.linkedin.com/in/aisha-patel-swmedical" },
    { fullName: "Marcus Webb", firstName: "Marcus", lastName: "Webb", jobTitle: "VP of Clinical Operations", jobSeniority: "VP", department: "Clinical Operations", companyName: "CHRISTUS Health", companyWebsite: "https://www.christushealth.org", companyLinkedin: "https://www.linkedin.com/company/christus-health", email: "m.webb@christushealth.org", emailStatus: "verified", city: "Irving", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (972) 555-0204", linkedin: "https://www.linkedin.com/in/marcus-webb-christus" },
    { fullName: "Vanessa Hollins", firstName: "Vanessa", lastName: "Hollins", jobTitle: "Director of Group Travel", jobSeniority: "Director", department: "Travel & Procurement", companyName: "North Texas Heart Center", companyWebsite: "https://www.ntheart.com", companyLinkedin: "https://www.linkedin.com/company/north-texas-heart-center", email: "v.hollins@ntheart.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0217", linkedin: "https://www.linkedin.com/in/vanessa-hollins-nthc" },
    { fullName: "Kenneth Shaw", firstName: "Kenneth", lastName: "Shaw", jobTitle: "Hospital Administrator", jobSeniority: "C-Suite", department: "Administration", companyName: "VA North Texas Health Care", companyWebsite: "https://www.northtexas.va.gov", companyLinkedin: "https://www.linkedin.com/company/va-north-texas-health-care-system", email: "k.shaw@va.gov", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0229", linkedin: "https://www.linkedin.com/in/kenneth-shaw-va" },
    { fullName: "Natalie Brooks", firstName: "Natalie", lastName: "Brooks", jobTitle: "Director of Medical Education", jobSeniority: "Director", department: "Medical Education", companyName: "UT Health", companyWebsite: "https://www.uth.edu", companyLinkedin: "https://www.linkedin.com/company/ut-health-science-center-at-houston", email: "n.brooks@uthealth.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0243", linkedin: "https://www.linkedin.com/in/natalie-brooks-uthealth" },
    { fullName: "Derek Manning", firstName: "Derek", lastName: "Manning", jobTitle: "VP of Operations", jobSeniority: "VP", department: "Operations", companyName: "Baylor Scott & White Research Institute", companyWebsite: "https://www.bswri.org", companyLinkedin: "https://www.linkedin.com/company/baylor-scott-white-research-institute", email: "d.manning@bswri.org", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0256", linkedin: "https://www.linkedin.com/in/derek-manning-bswri" },
    { fullName: "Christine Yao", firstName: "Christine", lastName: "Yao", jobTitle: "Corporate Procurement Director", jobSeniority: "Director", department: "Procurement", companyName: "Tenet Healthcare", companyWebsite: "https://www.tenethealth.com", companyLinkedin: "https://www.linkedin.com/company/tenet-healthcare", email: "c.yao@tenethealth.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Healthcare", mobilePhone: "+1 (214) 555-0268", linkedin: "https://www.linkedin.com/in/christine-yao-tenet" },
  ],
  Technology: [
    { fullName: "Andrew Kim", firstName: "Andrew", lastName: "Kim", jobTitle: "VP of Product", jobSeniority: "VP", department: "Product Management", companyName: "Dialexa", companyWebsite: "https://www.dialexa.com", companyLinkedin: "https://www.linkedin.com/company/dialexa", email: "a.kim@dialexa.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (214) 555-0281", linkedin: "https://www.linkedin.com/in/andrew-kim-dialexa" },
    { fullName: "Rachel Stone", firstName: "Rachel", lastName: "Stone", jobTitle: "Director of People Ops", jobSeniority: "Director", department: "Human Resources", companyName: "Perot Museum of Nature & Science", companyWebsite: "https://www.perotmuseum.org", companyLinkedin: "https://www.linkedin.com/company/perot-museum-of-nature-science", email: "r.stone@perotmuseum.org", emailStatus: "guessed", city: "Dallas", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (214) 555-0294", linkedin: "https://www.linkedin.com/in/rachel-stone-perot" },
    { fullName: "Chris Nguyen", firstName: "Chris", lastName: "Nguyen", jobTitle: "CTO", jobSeniority: "C-Suite", department: "Engineering", companyName: "Toptal", companyWebsite: "https://www.toptal.com", companyLinkedin: "https://www.linkedin.com/company/toptal", email: "c.nguyen@toptal.com", emailStatus: "verified", city: "Austin", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (512) 555-0307", linkedin: "https://www.linkedin.com/in/chris-nguyen-toptal" },
    { fullName: "Megan Sullivan", firstName: "Megan", lastName: "Sullivan", jobTitle: "VP of Customer Success", jobSeniority: "VP", department: "Customer Success", companyName: "Sendoso", companyWebsite: "https://www.sendoso.com", companyLinkedin: "https://www.linkedin.com/company/sendoso", email: "m.sullivan@sendoso.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (214) 555-0319", linkedin: "https://www.linkedin.com/in/megan-sullivan-sendoso" },
    { fullName: "Brian Foster", firstName: "Brian", lastName: "Foster", jobTitle: "Director of IT", jobSeniority: "Director", department: "Information Technology", companyName: "Fossil Group", companyWebsite: "https://www.fossilgroup.com", companyLinkedin: "https://www.linkedin.com/company/fossil-group", email: "b.foster@fossil.com", emailStatus: "guessed", city: "Richardson", region: "TX", country: "United States", industry: "Technology", mobilePhone: "+1 (972) 555-0332", linkedin: "https://www.linkedin.com/in/brian-foster-fossil" },
  ],
  Construction: [
    { fullName: "Patrick Jordan", firstName: "Patrick", lastName: "Jordan", jobTitle: "VP of Business Development", jobSeniority: "VP", department: "Business Development", companyName: "Skanska USA", companyWebsite: "https://www.usa.skanska.com", companyLinkedin: "https://www.linkedin.com/company/skanska-usa", email: "p.jordan@skanska.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (214) 555-0345", linkedin: "https://www.linkedin.com/in/patrick-jordan-skanska" },
    { fullName: "Lisa Hammond", firstName: "Lisa", lastName: "Hammond", jobTitle: "Director of HSE", jobSeniority: "Director", department: "Health, Safety & Environment", companyName: "Jacobs Engineering", companyWebsite: "https://www.jacobs.com", companyLinkedin: "https://www.linkedin.com/company/jacobs-engineering-group", email: "l.hammond@jacobs.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (214) 555-0358", linkedin: "https://www.linkedin.com/in/lisa-hammond-jacobs" },
    { fullName: "Kevin Ortiz", firstName: "Kevin", lastName: "Ortiz", jobTitle: "Project Executive", jobSeniority: "VP", department: "Project Management", companyName: "Hensel Phelps", companyWebsite: "https://www.henselphelps.com", companyLinkedin: "https://www.linkedin.com/company/hensel-phelps", email: "k.ortiz@henselphelps.com", emailStatus: "guessed", city: "Fort Worth", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (817) 555-0371", linkedin: "https://www.linkedin.com/in/kevin-ortiz-henselphelps" },
    { fullName: "Diane Russell", firstName: "Diane", lastName: "Russell", jobTitle: "HR Manager", jobSeniority: "Manager", department: "Human Resources", companyName: "Kitchell Corporation", companyWebsite: "https://www.kitchell.com", companyLinkedin: "https://www.linkedin.com/company/kitchell-corporation", email: "d.russell@kitchell.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Construction", mobilePhone: "+1 (214) 555-0384", linkedin: "https://www.linkedin.com/in/diane-russell-kitchell" },
  ],
  Finance: [
    { fullName: "Victor Chang", firstName: "Victor", lastName: "Chang", jobTitle: "Managing Partner", jobSeniority: "C-Suite", department: "Investment Management", companyName: "Hillwood Capital", companyWebsite: "https://www.hillwood.com", companyLinkedin: "https://www.linkedin.com/company/hillwood", email: "v.chang@hillwood.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "United States", industry: "Finance", mobilePhone: "+1 (817) 555-0397", linkedin: "https://www.linkedin.com/in/victor-chang-hillwood" },
    { fullName: "Susan Blake", firstName: "Susan", lastName: "Blake", jobTitle: "VP of Private Wealth", jobSeniority: "VP", department: "Private Banking", companyName: "Comerica Bank", companyWebsite: "https://www.comerica.com", companyLinkedin: "https://www.linkedin.com/company/comerica", email: "s.blake@comerica.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "United States", industry: "Finance", mobilePhone: "+1 (214) 555-0410", linkedin: "https://www.linkedin.com/in/susan-blake-comerica" },
    { fullName: "Nathan Cross", firstName: "Nathan", lastName: "Cross", jobTitle: "Director of Risk Management", jobSeniority: "Director", department: "Risk Management", companyName: "Fidelity Investments", companyWebsite: "https://www.fidelity.com", companyLinkedin: "https://www.linkedin.com/company/fidelity-investments", email: "n.cross@fidelity.com", emailStatus: "guessed", city: "Westlake", region: "TX", country: "United States", industry: "Finance", mobilePhone: "+1 (817) 555-0423", linkedin: "https://www.linkedin.com/in/nathan-cross-fidelity" },
  ],
  Defense: [
    { fullName: "Brig. Gen. Rita Morales (Ret.)", firstName: "Rita", lastName: "Morales", jobTitle: "VP of Defense Programs", jobSeniority: "VP", department: "Government Relations", companyName: "General Dynamics", companyWebsite: "https://www.gd.com", companyLinkedin: "https://www.linkedin.com/company/general-dynamics", email: "r.morales@gd.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "United States", industry: "Defense", mobilePhone: "+1 (817) 555-0436", linkedin: "https://www.linkedin.com/in/rita-morales-gd" },
    { fullName: "Christopher Holt", firstName: "Christopher", lastName: "Holt", jobTitle: "Director of Contracts", jobSeniority: "Director", department: "Contracts & Procurement", companyName: "Bell Textron", companyWebsite: "https://www.bellflight.com", companyLinkedin: "https://www.linkedin.com/company/bell-flight", email: "c.holt@bellflight.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "United States", industry: "Defense", mobilePhone: "+1 (817) 555-0449", linkedin: "https://www.linkedin.com/in/christopher-holt-bell" },
  ],
  Education: [
    { fullName: "Dr. Samuel Okafor", firstName: "Samuel", lastName: "Okafor", jobTitle: "Provost", jobSeniority: "C-Suite", department: "Academic Affairs", companyName: "Texas Christian University", companyWebsite: "https://www.tcu.edu", companyLinkedin: "https://www.linkedin.com/school/texas-christian-university", email: "s.okafor@tcu.edu", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "United States", industry: "Education", mobilePhone: "+1 (817) 555-0462", linkedin: "https://www.linkedin.com/in/samuel-okafor-tcu" },
    { fullName: "Heather Daniels", firstName: "Heather", lastName: "Daniels", jobTitle: "Director of Alumni Relations", jobSeniority: "Director", department: "Alumni & External Relations", companyName: "UNT", companyWebsite: "https://www.unt.edu", companyLinkedin: "https://www.linkedin.com/school/university-of-north-texas", email: "h.daniels@unt.edu", emailStatus: "guessed", city: "Denton", region: "TX", country: "United States", industry: "Education", mobilePhone: "+1 (940) 555-0475", linkedin: "https://www.linkedin.com/in/heather-daniels-unt" },
    { fullName: "Marcus Lee", firstName: "Marcus", lastName: "Lee", jobTitle: "VP of External Affairs", jobSeniority: "VP", department: "External Affairs", companyName: "Texas A&M Commerce", companyWebsite: "https://www.tamuc.edu", companyLinkedin: "https://www.linkedin.com/school/texas-am-university-commerce", email: "m.lee@tamuc.edu", emailStatus: "verified", city: "Commerce", region: "TX", country: "United States", industry: "Education", mobilePhone: "+1 (903) 555-0488", linkedin: "https://www.linkedin.com/in/marcus-lee-tamuc" },
  ],
};

function filterBySeniority(leads: VibeLeadRaw[], seniority: string): VibeLeadRaw[] {
  if (!seniority || seniority === "Any") return leads;
  const rank: Record<string, number> = { "Manager": 1, "Director": 2, "VP": 3, "C-Suite": 4 };
  const minRank = seniority.includes("C-Suite") ? 4 : seniority.includes("VP") ? 3 : seniority.includes("Director") ? 2 : 1;
  return leads.filter((l) => (rank[l.jobSeniority] ?? 0) >= minRank);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { industry = "Healthcare", seniority } = body;

    await new Promise((r) => setTimeout(r, 1200));

    const base = SAMPLE_LEADS[industry] ?? SAMPLE_LEADS.Healthcare;
    const filtered = filterBySeniority(base, seniority as string);

    const leads = filtered.map((l) => ({
      // Workspace / display schema
      fullName: l.fullName,
      firstName: l.firstName,
      lastName: l.lastName,
      jobTitle: l.jobTitle,
      jobSeniority: l.jobSeniority,
      department: l.department,
      companyName: l.companyName,
      companyWebsite: l.companyWebsite,
      companyLinkedin: l.companyLinkedin,
      email: l.email,
      emailStatus: l.emailStatus,
      city: l.city,
      region: l.region,
      country: l.country,
      industry: l.industry,
      mobilePhone: l.mobilePhone,
      linkedin: l.linkedin,
      // Lead table schema (prospect* / contact* fields)
      prospectFullName: l.fullName,
      prospectFirstName: l.firstName,
      prospectLastName: l.lastName,
      prospectJobTitle: l.jobTitle,
      prospectJobSeniorityLevel: l.jobSeniority,
      prospectJobDepartment: l.department,
      prospectLinkedin: l.linkedin,
      prospectCity: l.city,
      prospectRegionName: l.region,
      prospectCountryName: l.country,
      prospectCompanyName: l.companyName,
      prospectCompanyWebsite: l.companyWebsite,
      prospectCompanyLinkedin: l.companyLinkedin,
      contactProfessionalEmail: l.email,
      contactProfessionalEmailStatus: l.emailStatus as "verified" | "guessed" | "unverified",
      contactMobilePhone: l.mobilePhone,
      contactPhoneNumbers: [l.mobilePhone],
      source: "vibe",
      funnel: "hustle",
      status: "new",
    }));

    return Response.json({ leads, total: leads.length, source: "vibe" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vibe search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
