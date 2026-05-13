import { NextRequest, NextResponse } from "next/server";
import { loadAllPlaybooks, loadPlaybook, loadPlaybookRaw } from "@/lib/playbooks-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const raw = searchParams.get("raw");

  if (id) {
    if (raw === "true") {
      const content = await loadPlaybookRaw(id);
      if (!content) {
        return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, content });
    }
    const playbook = await loadPlaybook(id);
    if (!playbook) {
      return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, playbook });
  }

  const playbooks = await loadAllPlaybooks();
  return NextResponse.json({ success: true, playbooks });
}
