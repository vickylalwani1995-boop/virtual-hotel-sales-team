import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";
import { resolveApiKey } from "@/lib/api-key";
import { getAgent } from "@/lib/agents";

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

    // Read skill file
    const skillPath = path.join(process.cwd(), "skills", `${agentId}.md`);
    const skill = await fs.readFile(skillPath, "utf-8");

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
      : `Engage in natural back-and-forth. Be concise by default, expand when asked. Use markdown for structure (bold, tables, lists). End with a follow-up question OR a suggested next action. Stay in character as the ${agent.name}.`;

    const system = `${skill}

---

You are talking with a hotel sales captain in conversation.

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
