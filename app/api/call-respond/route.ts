import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { resolveApiKey } from "@/lib/api-key";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Short conversational responses for the call simulator.
 * Uses Claude to generate realistic phone call dialogue.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agentId,
      agentName,
      leadName,
      leadCompany,
      leadTitle,
      hotelProfile,
      transcript,
      userMessage,
    } = body;

    if (!userMessage) {
      return Response.json(
        { error: "userMessage is required" },
        { status: 400 }
      );
    }

    const apiKey = await resolveApiKey();
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not set" },
        { status: 500 }
      );
    }

    const leadContext = leadName
      ? `You are speaking with ${leadName}${leadTitle ? `, ${leadTitle}` : ""}${leadCompany ? ` at ${leadCompany}` : ""}.`
      : "You are speaking with a potential client.";

    const system = `You are ${agentName || "a hotel sales agent"} on a live phone call. ${leadContext}

You represent a hotel and are making a sales/outreach call. Keep responses SHORT (1-3 sentences max) — this is a phone conversation, not an email.

Be natural, warm, and professional. Use conversational language, not formal email-style writing. React to what the caller says. If they seem busy, be respectful of their time.

${hotelProfile ? `Hotel context:\n${hotelProfile}` : ""}

Previous conversation:
${transcript || "(call just started)"}

Respond naturally to the caller's latest message. Keep it brief and conversational.`;

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "I appreciate your time. Let me follow up with more details via email.";

    return Response.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Call response failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
