import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { resolveApiKey } from "@/lib/api-key";
import { AGENTS } from "@/lib/agents";

export const runtime = "nodejs";

type Transcript = { role: "user" | "agent"; text: string; ts?: string }[];

const SYSTEM_PROMPT = `You are a hotel sales analyst. The user just finished a voice call with one of their AI sales specialists. Read the transcript and return a JSON object with this exact shape, no extra keys, no prose, no markdown fences:

{
  "keyTopics": string[],            // 3-6 short phrases
  "actionItems": string[],          // 2-5 imperative bullets the human should do next
  "recommendedNextAgent": string,   // one of the agent IDs from the list provided
  "followUpSuggestion": string,     // 1-2 sentence suggested follow-up email subject + opener
  "sentiment": "positive" | "neutral" | "negative",
  "opportunityScore": number        // 1-10, integer
}

Be concrete. Reference specifics from the transcript. If the call was short or off-topic, mark sentiment "neutral" and opportunityScore <= 4.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript: Transcript = Array.isArray(body?.transcript)
      ? body.transcript
      : [];
    const agentId: string = body?.agentId ?? "";
    const duration: number = Number(body?.duration ?? 0);

    if (transcript.length === 0) {
      return NextResponse.json(
        { success: false, error: "Transcript is empty." },
        { status: 400 },
      );
    }

    const apiKey = await resolveApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable post-call analysis.",
        },
        { status: 500 },
      );
    }

    const agent = AGENTS.find((a) => a.id === agentId);
    const transcriptText = transcript
      .map((t) => `${t.role === "user" ? "USER" : (agent?.realName ?? "AGENT")}: ${t.text}`)
      .join("\n");

    const userPrompt = `Call duration: ${Math.round(duration)}s. Agent: ${agent?.realName ?? agentId} (id: ${agentId}).

Available agent IDs (use one for recommendedNextAgent):
${AGENTS.map((a) => `- ${a.id} (${a.realName})`).join("\n")}

Transcript:
${transcriptText}`;

    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw =
      msg.content
        .map((c) => (c.type === "text" ? c.text : ""))
        .join("") || "{}";

    // Strip code fences if the model snuck them in despite the instruction
    const cleaned = raw
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Model returned non-JSON. Try the call again.",
          raw: cleaned.slice(0, 400),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, analysis: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
