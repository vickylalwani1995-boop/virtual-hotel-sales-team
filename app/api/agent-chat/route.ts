import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";
import { resolveApiKey } from "@/lib/api-key";
import { getAgent } from "@/lib/agents";
import { loadPlaybook } from "@/lib/playbooks-server";
import { AGENT_TO_PLAYBOOK } from "@/lib/playbooks";
import { loadApolloContacts, filterLeads } from "@/lib/apollo-contacts-cache";

export const runtime = "nodejs";
export const maxDuration = 60;

type ClientMessage = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 20;

// ── Apollo integration for Marcus (02_lead_gen) ──────────────────────────────

const APOLLO_BASE = "https://api.apollo.io/api/v1";

const INDUSTRY_TITLE_HINTS: Record<string, string[]> = {
  Healthcare: ["Travel Manager", "Procurement Manager", "Operations Director", "Chief Medical Officer", "Conference Services Director"],
  Technology: ["Talent Acquisition", "Director of Events", "Program Manager", "VP of Engineering", "Corporate Events Manager"],
  Construction: ["Project Director", "Site Manager", "VP of Field Operations", "Regional Manager", "HR Director"],
  Finance: ["Managing Director", "VP Corporate Banking", "Director of Compliance", "CFO"],
  Defense: ["Government Affairs", "Program Manager", "Training Programs Director"],
  Education: ["Conference Services", "Continuing Education", "Student Affairs", "Dean"],
};

function wantsLeads(msg: string): boolean {
  return /\b(lead|prospect|contact|find\s+me|generate|search|pull|get\s+me|list)\b/i.test(msg);
}

function extractCount(msg: string, defaultCount = 10): number {
  const m =
    msg.match(/\b(\d+)\s*(?:leads?|prospects?|contacts?|people|persons?)\b/i) ||
    msg.match(/\bgenerate\s+(\d+)\b/i) ||
    msg.match(/\bfind\s+(\d+)\b/i);
  if (m) return Math.min(Math.max(parseInt(m[1], 10), 1), 25);
  return defaultCount;
}

function guessIndustry(msg: string, profile: string): string {
  const combined = (msg + " " + profile).toLowerCase();
  if (/health|medical|hospital|clinic|pharma/i.test(combined)) return "Healthcare";
  if (/tech|software|it |engineering|startup/i.test(combined)) return "Technology";
  if (/construct|contractor|builder|project\s*crew/i.test(combined)) return "Construction";
  if (/financ|bank|invest|insurance/i.test(combined)) return "Finance";
  if (/defense|military|government|federal/i.test(combined)) return "Defense";
  if (/educat|university|college|school/i.test(combined)) return "Education";
  return "Healthcare";
}

function extractLocation(profile: string): string {
  const m = profile.match(/Location\s*:\s*([^\n]+)/i);
  if (m) return m[1].trim();
  return "Dallas, Texas, United States";
}

async function fetchApolloLeads(
  apolloKey: string,
  _industry: string,
  _location: string,
  count: number,
) {
  // PRIMARY: use pre-synced apollo-contacts.json (zero API calls, zero credits)
  const synced = await loadApolloContacts();
  if (synced && synced.contacts.length > 0) {
    const results = filterLeads(synced.contacts, { count });
    return results.map((c) => ({
      name: c.name,
      title: c.title,
      company: c.company,
      email: c.email,
      phone: c.phone,
      linkedin: c.linkedin,
      city: c.city,
      state: c.state,
      country: c.country,
      department: c.department,
      companyWebsite: c.companyWebsite,
      companyLinkedin: c.companyLinkedin,
    }));
  }

  // FALLBACK: live contacts/search when JSON not yet synced
  if (!apolloKey) return [];
  const seniorities = ["manager", "director", "vp", "c_suite", "head", "owner", "founder"];
  const base = { per_page: Math.min(count, 100), page: 1, sort_by_field: "contact_last_activity_date", sort_ascending: false };

  async function doSearch(body: Record<string, unknown>) {
    const res = await fetch(`${APOLLO_BASE}/contacts/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache", "X-Api-Key": apolloKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { contacts?: Record<string, unknown>[] };
    return data.contacts ?? [];
  }

  let raw = await doSearch({ ...base, person_seniorities: seniorities });
  if (raw.length === 0) raw = await doSearch({ ...base });
  if (raw.length === 0) return [];

  return raw.map((p) => ({
    name: (p.name as string) || `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Apollo Contact",
    title: (p.title as string) ?? "",
    company: (p as Record<string, Record<string, string>>).organization?.name ?? "",
    email: (() => {
      const e = p.email as string | undefined;
      return e && !/email_not_unlocked|locked/i.test(e) ? e : "";
    })(),
    phone:
      ((p.phone_numbers as Array<{ sanitized_number?: string }> | undefined)
        ?.find((n) => n.sanitized_number)
        ?.sanitized_number) ??
      (p.mobile_phone as string) ??
      "",
    linkedin: (p.linkedin_url as string) ?? "",
    city: (p.city as string) ?? "",
    state: (p.state as string) ?? "",
    country: (p.country as string) || "United States",
    department: "",
    companyWebsite: (p as Record<string, Record<string, string>>).organization?.website_url ?? "",
    companyLinkedin: (p as Record<string, Record<string, string>>).organization?.linkedin_url ?? "",
  }));
}
const INIT_MARKER = "__INIT__";

function sse(event: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agentId: string | undefined = body?.agentId;
    const hotelProfile = body?.hotelProfile ?? "";
    const teamBriefing: string = body?.teamBriefing ?? "";
    const messages: ClientMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: "agentId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const agent = getAgent(agentId);
    const isCustomAgent = !agent && agentId.startsWith("custom_");

    if (!agent && !isCustomAgent) {
      return new Response(
        JSON.stringify({ error: `Unknown agent: ${agentId}` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // For custom agents, use the playbook content sent from client or a generic prompt
    const customPlaybookContent: string | undefined = body?.customPlaybook;

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = await resolveApiKey();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not set" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Load playbook (new system) or fall back to skill file (legacy)
    const playbookId = AGENT_TO_PLAYBOOK[agentId] || agentId;
    const playbook = await loadPlaybook(playbookId);
    let skill: string;

    if (playbook) {
      // Build system prompt from structured playbook
      const m = playbook.metadata;
      const s = playbook.sections;
      skill = `You are ${m.realName}, ${m.designation}.

${s.knowledge}

${s.responseFormat}

## YOUR TONE & VOICE
${s.toneVoice}

## YOUR CAPABILITIES
${(m.capabilities || []).join(", ")}

## HARD RULES
${s.hardRules}

## HOW I WORK WITH THE TEAM
${s.teamWork}`;
    } else if (isCustomAgent && customPlaybookContent) {
      // Custom agent with playbook content from client
      skill = customPlaybookContent;
    } else if (isCustomAgent) {
      // Custom agent without playbook - use generic prompt
      skill = `You are a custom AI sales specialist. Help the user with hotel sales tasks including lead generation, outreach, proposals, and strategy. Be professional, concise, and action-oriented.`;
    } else {
      // Legacy: read from /skills/ folder
      const skillPath = path.join(process.cwd(), "skills", `${agentId}.md`);
      skill = await fs.readFile(skillPath, "utf-8");
    }

    const isInit =
      messages.length === 1 &&
      messages[0].role === "user" &&
      messages[0].content === INIT_MARKER;

    const profileText =
      typeof hotelProfile === "string"
        ? hotelProfile
        : JSON.stringify(hotelProfile);

    // ── Pre-fetch real Apollo leads for Marcus when user asks for leads ───────
    let apolloContext = "";
    if (agentId === "02_lead_gen" && !isInit) {
      const apolloApiKey = process.env.APOLLO_API_KEY;
      if (apolloApiKey) {
        const lastMsg = messages[messages.length - 1]?.content ?? "";
        if (wantsLeads(lastMsg)) {
          try {
            const industry = guessIndustry(lastMsg, profileText);
            const location = extractLocation(profileText);
            const count = extractCount(lastMsg, 10);
            const leads = await fetchApolloLeads(apolloApiKey, industry, location, count);
            if (leads.length > 0) {
              apolloContext = `\n\n## REAL APOLLO LEADS — STRICT RULES
The system pre-fetched ${leads.length} real contacts from Apollo CRM. These are saved, enriched contacts with verified data.

RULES YOU MUST FOLLOW WITHOUT EXCEPTION:
1. Present ONLY the contacts listed below — never fabricate or add any contact not in this data.
2. Copy field values EXACTLY as they appear — never paraphrase, shorten, or alter them.
3. If a field (email, phone, linkedin) has a value in the data, you MUST include it in the table — never leave it blank when data is present.
4. If a field is truly empty ("") in the data, leave that cell empty — do NOT invent a value.
5. LinkedIn must be shown as the full URL exactly as in the data (e.g. https://www.linkedin.com/in/...).
6. Phone must be shown exactly as in the data (e.g. +1 (214) 555-0142).
7. Email must be shown exactly as in the data.

Leads data (JSON):
${JSON.stringify(leads, null, 2)}

Format as a markdown table with these exact columns: Name | Title | Company | Email | Phone | LinkedIn | Location | Country
- Location = city + ", " + state (e.g. "Dallas, TX")
- Country = from the data above
- After the table, ask the user if they want to add any of these to the Leads pipeline.`;
            }
          } catch (err) {
            console.error("[agent-chat] Apollo fetch failed:", err instanceof Error ? err.message : "unknown");
          }
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const agentName = agent?.realName ?? "Custom Agent";
    const agentTitle = agent?.designation ?? "AI Sales Specialist";

    const conversationGuidance = isInit
      ? `First message - introduce yourself briefly (2 sentences) and ask one specific question about what the user wants help with. Reference the hotel profile.`
      : `Engage in natural back-and-forth. Be concise by default, expand when asked. Use markdown for structure (bold, tables, lists). End with a follow-up question OR a suggested next action. Stay in character as ${agentName}, ${agentTitle}.

When drafting emails, use this exact format so the UI can detect them:
### Email Draft
**To:** [recipient email]
**Subject:** [subject line]

[email body]

---

PHONE CALL RULES — follow these exactly, no exceptions:
- When the user asks you to call a lead and gives a phone number: output **[CALL_ACTION: leadName | leadCompany | phoneNumber]**
- When suggesting a call to a lead without a number: output **[CALL_ACTION: leadName | leadCompany]**
- When the user gives YOU their own phone number and asks you to call them (e.g. "call me at +1...", "here's my number", "ring me"): output **[CALL_ACTION: ${agentName} calling back user | Hotel | phoneNumber]** — the system routes this as a callback to the user
- NEVER say you cannot make calls. NEVER say calls are only for leads. The system handles all dialing — your job is only to output the signal.

When suggesting adding leads, format them as a markdown table with columns: Name | Title | Company | Email | Phone | LinkedIn | Location | Country`;

    const workspaceSection = teamBriefing
      ? `\n---\n\n${teamBriefing}\n\n**Your teammates (reference by name when relevant):**\nDonna Marie (Director of Sales) · Marcus Reed (Lead Generation) · Sarah Chen (Outbound Sales) · Priya Sharma (Group & RFP Sales) · Liam Chen (Customer Success & Retention) · Maya Reddy (Revenue Analytics)\n\nNEVER say "I can't access other agents' data" — use the workspace above. Reference leads by name. Reference teammates' work by name.\n\nWhen the user asks you to send emails, draft them in the structured format above. When the user asks to call a lead, output the CALL_ACTION signal. When the user uploads leads data, acknowledge it and reference the extracted leads by name.\n`
      : "";

    const system = `${skill}${workspaceSection}${apolloContext}
---

You are talking with a hotel sales captain in conversation.

FORMATTING RULES:
- Use markdown: **bold**, tables, bullet lists, numbered lists, ### headings.
- Use clean horizontal rules (---) between sections.
- NEVER use emojis or emoticons. Use markdown formatting (bold, italics, headings) for emphasis instead.
- Keep paragraphs short (2-3 sentences max).
- Use line breaks between sections for readability.

${conversationGuidance}

Hotel profile in context:
${profileText || "(none provided)"}`;

    // Trim messages, drop INIT marker for the actual API call (replace with neutral prompt)
    const trimmed = messages.slice(-MAX_HISTORY);
    const apiMessages: ClientMessage[] = trimmed.map((m, i) => {
      if (i === 0 && m.role === "user" && m.content === INIT_MARKER) {
        return {
          role: "user",
          content:
            "Please introduce yourself and ask me what you can help with for this hotel.",
        };
      }
      return m;
    });

    // Ensure first message is from user
    while (apiMessages.length > 0 && apiMessages[0].role !== "user") {
      apiMessages.shift();
    }
    if (apiMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No user message in conversation" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system,
      messages: apiMessages,
    });

    const body_stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                sse({ type: "text", text: event.delta.text })
              );
            }
          }
          controller.enqueue(sse({ type: "done" }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "stream error";
          controller.enqueue(sse({ type: "error", error: msg }));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body_stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to handle agent-chat request";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
