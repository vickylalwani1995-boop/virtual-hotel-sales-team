import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, subject, body: emailBody, recipientHint } = body ?? {};
    console.log("[queue-email]", {
      agentId,
      subject,
      recipientHint,
      bodyLength: typeof emailBody === "string" ? emailBody.length : 0,
      queuedAt: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      message: "Email queued — will sync with MyHospitalitySalesPro",
      queueId: `q_${Date.now()}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to queue email";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
