import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Theatre Apollo search API.
 * Returns sample leads matching the search criteria.
 * In production, this would call the Apollo API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { industry, location, seniority } = body;

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 1500));

    // Return empty — the client will fall back to built-in sample data
    return Response.json({
      leads: [],
      total: 0,
      source: "apollo",
      note: "Apollo API integration pending. Using sample data on client.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apollo search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
