import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";
import { getAgent } from "@/lib/agents";
import { resolveApiKey } from "@/lib/api-key";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, hotelProfile, extraInputs } = body ?? {};

    if (typeof agentId !== "string" || !agentId) {
      return NextResponse.json(
        { success: false, error: "agentId (string) is required" },
        { status: 400 }
      );
    }
    if (
      hotelProfile === undefined ||
      hotelProfile === null ||
      (typeof hotelProfile !== "string" && typeof hotelProfile !== "object")
    ) {
      return NextResponse.json(
        { success: false, error: "hotelProfile (string or object) is required" },
        { status: 400 }
      );
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: `Unknown agentId: ${agentId}` },
        { status: 404 }
      );
    }

    const apiKey = await resolveApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "ANTHROPIC_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const skillPath = path.join(process.cwd(), "skills", `${agentId}.md`);
    const skill = await fs.readFile(skillPath, "utf-8");

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: skill,
      messages: [
        {
          role: "user",
          content: JSON.stringify({ hotelProfile, extraInputs }),
        },
      ],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({
      success: true,
      output: text,
      agentName: agent.realName,
      agentId: agent.id,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Something went wrong running the agent.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
