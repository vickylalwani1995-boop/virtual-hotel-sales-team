import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { resolveApiKey } from "@/lib/api-key";
import { buildSystemPrompt, PageContext } from "@/lib/concierge-system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

type ClientMessage = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 20;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ClientMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];
    const pageContext: PageContext = body?.pageContext ?? {};

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

    // Cap history (rolling window) and ensure first kept message is from user.
    let trimmed = messages.slice(-MAX_HISTORY);
    while (trimmed.length > 0 && trimmed[0].role !== "user") {
      trimmed = trimmed.slice(1);
    }
    if (trimmed.length === 0) {
      return new Response(
        JSON.stringify({ error: "No user message in conversation" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });
    const system = buildSystemPrompt(pageContext);

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system,
      messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const body_stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "stream error";
          controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body_stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to handle concierge request";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
