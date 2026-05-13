import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";
import { resolveApiKey } from "@/lib/api-key";
import { getAgent } from "@/lib/agents";
import { loadPlaybook } from "@/lib/playbooks-server";
import { AGENT_TO_PLAYBOOK } from "@/lib/playbooks";

export const runtime = "nodejs";
export const maxDuration = 60;

type ClientMessage = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 20;
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
    if (!agent) {
      return new Response(
        JSON.stringify({ error: `Unknown agent: ${agentId}` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

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

    const conversationGuidance = isInit
      ? `First message - introduce yourself briefly (2 sentences) and ask one specific question about what the user wants help with. Reference the hotel profile.`
      : `Engage in natural back-and-forth. Be concise by default, expand when asked. Use markdown for structure (bold, tables, lists). End with a follow-up question OR a suggested next action. Stay in character as ${agent.realName}, ${agent.designation}.

When drafting emails, use this exact format so the UI can detect them:
### Email Draft
**To:** [recipient email]
**Subject:** [subject line]

[email body]

---

When suggesting a call, use: **[CALL_ACTION: leadName | leadCompany]**
When suggesting adding leads, format them as a markdown table with columns: Name | Title | Company | Email | Phone`;

    const workspaceSection = teamBriefing
      ? `\n---\n\n${teamBriefing}\n\n**Your teammates (reference by name when relevant):**\nDonna Marie (Director of Sales) · Marcus Reed (Lead Generation) · Sarah Chen (Outbound Sales) · Priya Sharma (Group & RFP Sales) · Liam Chen (Customer Success & Retention) · Maya Reddy (Revenue Analytics)\n\nNEVER say "I can't access other agents' data" — use the workspace above. Reference leads by name. Reference teammates' work by name.\n\nWhen the user asks you to send emails, draft them in the structured format above. When the user asks to call a lead, output the CALL_ACTION signal. When the user uploads leads data, acknowledge it and reference the extracted leads by name.\n`
      : "";

    const system = `${skill}${workspaceSection}
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
