import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Theatre CRM export API.
 * Simulates exporting leads to various CRM/marketing platforms.
 * In production, each destination would use its respective API.
 */

const DESTINATION_NAMES: Record<string, string> = {
  google_sheets: "Google Sheets",
  inntelligent: "Inntelligent CRM",
  hubspot: "HubSpot",
  salesforce: "Salesforce",
  pipedrive: "Pipedrive",
  zoho: "Zoho CRM",
  mailchimp: "Mailchimp",
  activecampaign: "ActiveCampaign",
  klaviyo: "Klaviyo",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, leadCount, leadIds } = body as {
      destination: string;
      leadCount: number;
      leadIds: string[];
    };

    if (!destination || !leadCount) {
      return Response.json(
        { error: "destination and leadCount are required" },
        { status: 400 }
      );
    }

    const destName = DESTINATION_NAMES[destination] || destination;

    // Simulate processing delay (theatre)
    await new Promise((r) => setTimeout(r, 2000));

    // Generate mock response based on destination
    const ts = Date.now();
    let url: string | undefined;
    let contactIds: string[] = [];

    switch (destination) {
      case "google_sheets":
        url = `https://docs.google.com/spreadsheets/d/MOCK_${ts}/edit`;
        break;
      case "inntelligent":
        contactIds = leadIds.map((_, i) => `inn_${ts}_${String(i + 1).padStart(3, "0")}`);
        url = `https://app.inntelligentcrm.com/contacts?batch=${ts}`;
        break;
      case "hubspot":
        contactIds = leadIds.map((_, i) => `hs_${ts}_${String(i + 1).padStart(3, "0")}`);
        url = `https://app.hubspot.com/contacts/mock/objects/contacts`;
        break;
      case "salesforce":
        contactIds = leadIds.map((_, i) => `sf_${ts}_${String(i + 1).padStart(3, "0")}`);
        url = `https://login.salesforce.com/mock/contacts`;
        break;
      case "pipedrive":
        contactIds = leadIds.map((_, i) => `pd_${ts}_${String(i + 1).padStart(3, "0")}`);
        break;
      case "zoho":
        contactIds = leadIds.map((_, i) => `zoho_${ts}_${String(i + 1).padStart(3, "0")}`);
        break;
      case "mailchimp":
        contactIds = leadIds.map((_, i) => `mc_${ts}_${String(i + 1).padStart(3, "0")}`);
        url = `https://us1.admin.mailchimp.com/lists/members?id=mock_${ts}`;
        break;
      case "activecampaign":
        contactIds = leadIds.map((_, i) => `ac_${ts}_${String(i + 1).padStart(3, "0")}`);
        break;
      case "klaviyo":
        contactIds = leadIds.map((_, i) => `kl_${ts}_${String(i + 1).padStart(3, "0")}`);
        break;
    }

    return Response.json({
      success: true,
      destination: destName,
      leadCount,
      contactIds: contactIds.slice(0, 5), // Only return first 5 for brevity
      totalCreated: leadCount,
      url,
      exportedAt: new Date().toISOString(),
      note: `In production, this would use the ${destName} API to create real contacts.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
