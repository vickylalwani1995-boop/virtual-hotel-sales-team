import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Theatre email-send API.
 * Simulates sending an email with a realistic delay.
 * In production, this would integrate with SendGrid, Mailchimp, or SES.
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

    // Simulate processing delay (theatre)
    await new Promise((r) => setTimeout(r, 1500));

    // In production: call email service here
    // e.g., await sendgrid.send({ to, from, subject, text: emailBody });

    const result = {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      to,
      subject,
      sentAt: new Date().toISOString(),
      scheduled: !!scheduledFor,
      scheduledFor: scheduledFor || null,
      provider: "theatre-mode",
      leadId: leadId || null,
      agentId: agentId || null,
    };

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
