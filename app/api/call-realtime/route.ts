import { NextResponse } from "next/server"
import { placeOutboundCalls } from "@/lib/voice-backend"

export async function POST(req: Request) {
  try {
    const { contacts, hotelData, agentId } = await req.json()
    if (!contacts?.length) {
      return NextResponse.json(
        { success: false, error: "No contacts" },
        { status: 400 },
      )
    }
    const result = await placeOutboundCalls(
      contacts,
      hotelData,
      agentId || "03_sarah_chen",
    )
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, mode: "error", error: String(error) },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    voiceBackendConfigured: !!process.env.VOICE_BACKEND_URL,
    inboundPhone: process.env.NEXT_PUBLIC_INBOUND_PHONE || "+1 276 262 6990",
    fallback: "browser_simulator",
  })
}
