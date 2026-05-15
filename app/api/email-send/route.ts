import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/**
 * Email-send API.
 * Sends real emails via Gmail SMTP when SMTP_USER & SMTP_PASS are set,
 * otherwise falls back to theatre mode (simulated).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, body: emailBody, leadId, agentId, scheduledFor } = body;

    if (!to || !subject) {
      return Response.json(
        { error: "Recipient (to) and subject are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return Response.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    let provider = "theatre-mode";
    let messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (smtpUser && smtpPass) {
      // Send real email via Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: `"MHSP Sales Team" <${smtpUser}>`,
        to,
        subject,
        html: (emailBody || "").replace(/\n/g, "<br>"),
      });

      provider = "gmail-smtp";
      messageId = info.messageId || messageId;
    } else {
      // Fallback: theatre mode
      await new Promise((r) => setTimeout(r, 1500));
    }

    const result = {
      success: true,
      messageId,
      to,
      subject,
      sentAt: new Date().toISOString(),
      scheduled: !!scheduledFor,
      scheduledFor: scheduledFor || null,
      provider,
      leadId: leadId || null,
      agentId: agentId || null,
    };

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
