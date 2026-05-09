import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 });
  }
  try {
    const filePath = path.join(
      process.cwd(),
      "sample-data",
      `${agentId}-conversation.json`
    );
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "no conversation cache" },
      { status: 404 }
    );
  }
}
