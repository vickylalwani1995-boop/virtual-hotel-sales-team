import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  mapApolloContact,
  invalidateCache,
  type ApolloApiContact,
} from "@/lib/apollo-contacts-cache";

export const runtime = "nodejs";
export const maxDuration = 60;

const APOLLO_BASE = "https://api.apollo.io/api/v1";
const FILE_PATH = path.join(process.cwd(), "sample-data", "apollo-contacts.json");
const PER_PAGE = 100;

export async function GET() {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as {
      generatedAt?: string;
      totalContacts?: number;
    };
    return Response.json({
      status: "synced",
      generatedAt: data.generatedAt ?? null,
      totalContacts: data.totalContacts ?? 0,
    });
  } catch {
    return Response.json({ status: "not_synced", totalContacts: 0 });
  }
}

export async function POST(_req: NextRequest) {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "APOLLO_API_KEY not configured" }, { status: 500 });
  }

  try {
    const allContacts: ApolloApiContact[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const res = await fetch(`${APOLLO_BASE}/contacts/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify({
          per_page: PER_PAGE,
          page,
          sort_by_field: "contact_last_activity_date",
          sort_ascending: false,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return Response.json(
          { error: `Apollo API error ${res.status}: ${text.slice(0, 300)}` },
          { status: 502 },
        );
      }

      const data = (await res.json()) as {
        contacts?: ApolloApiContact[];
        pagination?: { total_pages?: number; total_entries?: number };
      };

      const contacts = data.contacts ?? [];
      allContacts.push(...contacts);
      totalPages = data.pagination?.total_pages ?? 1;

      console.log(
        `[apollo-sync] page ${page}/${totalPages}: +${contacts.length} contacts (total: ${allContacts.length})`,
      );

      // Stop early if we got a partial page (last page)
      if (contacts.length < PER_PAGE) break;
      page++;

      // Small delay between pages to avoid rate limiting
      if (page <= totalPages) await new Promise((r) => setTimeout(r, 400));
    }

    const mapped = allContacts.map(mapApolloContact);

    const output = {
      generatedAt: new Date().toISOString(),
      totalContacts: mapped.length,
      source: "apollo-crm-sync",
      contacts: mapped,
    };

    await fs.writeFile(FILE_PATH, JSON.stringify(output, null, 2), "utf-8");
    invalidateCache();

    console.log(`[apollo-sync] Saved ${mapped.length} contacts to apollo-contacts.json`);

    return Response.json({
      success: true,
      totalContacts: mapped.length,
      generatedAt: output.generatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[apollo-sync] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
