import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * LiveKit-ready voice call routing.
 *
 * When LIVEKIT_FASTAPI_URL is configured in env, this route proxies
 * to the real LiveKit backend for production voice calls.
 * Otherwise, it returns a simulator fallback signal so the client
 * uses the browser-based Web Speech API simulator.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contacts, hotelData, agentId, mode: requestedMode } = body as {
      contacts: Array<{ id: string; name: string; company?: string; phone?: string }>;
      hotelData: { name: string; location: string };
      agentId?: string;
      mode?: "real" | "simulator";
    };

    if (!contacts || contacts.length === 0) {
      return Response.json(
        { error: "At least one contact is required" },
        { status: 400 }
      );
    }

    // If LiveKit FastAPI backend is configured, route to real voice
    const livekitUrl = process.env.LIVEKIT_FASTAPI_URL;
    if (livekitUrl && requestedMode !== "simulator") {
      try {
        const response = await fetch(`${livekitUrl}/api/call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.LIVEKIT_API_KEY
              ? { Authorization: `Bearer ${process.env.LIVEKIT_API_KEY}` }
              : {}),
          },
          body: JSON.stringify({
            contacts,
            hotelData,
            agentId,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`LiveKit backend error: ${err}`);
        }

        const data = await response.json();
        return Response.json({
          mode: "real",
          provider: "livekit",
          ...data,
        });
      } catch (e) {
        // If LiveKit fails, fall back to simulator
        console.error("LiveKit backend unreachable, falling back to simulator:", e);
      }
    }

    // Fallback: Web Speech API simulator
    return Response.json({
      mode: "simulator",
      message: "Using browser voice simulator. Configure LIVEKIT_FASTAPI_URL for real calls.",
      contacts: contacts.map((c) => ({
        id: c.id,
        name: c.name,
        status: "ready_for_simulator",
      })),
      callSessionId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Call routing failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
