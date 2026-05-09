import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAgent } from "@/lib/agents";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 });
  }
  if (!getAgent(agentId)) {
    return NextResponse.json({ error: "unknown agent" }, { status: 404 });
  }
  try {
    const filePath = path.join(process.cwd(), "skills", `${agentId}.md`);
    const content = await fs.readFile(filePath, "utf-8");
    return NextResponse.json({ success: true, content });
  } catch {
    return NextResponse.json(
      { success: false, error: "skill file not found" },
      { status: 404 }
    );
  }
}
