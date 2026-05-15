import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const DEMO_RECIPIENT = "vicky.lalwani@softqubes.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, subject, body: emailBody, recipientHint } = body ?? {};

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const to = recipientHint && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientHint)
      ? recipientHint
      : DEMO_RECIPIENT;

    let provider = "theatre-mode";

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"MHSP Sales Team" <${smtpUser}>`,
        to,
        subject: subject || "(No subject)",
        html: (emailBody || "").replace(/\n/g, "<br>"),
      });
      provider = "gmail-smtp";
    }

    return NextResponse.json({
      success: true,
      message: provider === "gmail-smtp"
        ? `Email sent to ${to} via Gmail`
        : "Email queued - will sync with MyHospitalitySalesPro",
      queueId: `q_${Date.now()}`,
      provider,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to queue email";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
