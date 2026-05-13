const VOICE_BACKEND_URL = process.env.VOICE_BACKEND_URL || ""
const VOICE_API_SECRET = process.env.VOICE_API_SECRET || ""

const AGENT_ID_MAP: Record<string, string> = {
  "01_donna_marie":  "01_donna",
  "02_marcus_reed":  "02_marcus",
  "03_sarah_chen":   "03_sarah",
  "04_priya_sharma": "04_priya",
  "05_liam_chen":    "05_liam",
  "06_maya_reddy":   "06_maya",
}

export interface VoiceContact {
  leadName: string
  phoneNumber: string
  leadTitle?: string
  companyName?: string
}

export interface VoiceHotelData {
  hotelName: string
  location: string
  rooms: number
  adr: number
  targetBusiness: string
  weakDays: string
  meetingSpace?: string
  occupancy?: string
}

export interface VoiceCallResult {
  success: boolean
  message: string
  count?: number
  agent?: string
  mode: "real" | "simulator" | "error"
  error?: string
}

export async function isVoiceBackendAvailable(): Promise<boolean> {
  if (!VOICE_BACKEND_URL) return false
  try {
    const res = await fetch(`${VOICE_BACKEND_URL}/api/health`, {
      method: "GET",
      cache: "no-store",
    })
    return res.ok
  } catch {
    return false
  }
}

export async function placeOutboundCalls(
  contacts: VoiceContact[],
  hotelData: VoiceHotelData,
  agentId: string,
): Promise<VoiceCallResult> {
  if (!VOICE_BACKEND_URL) {
    return {
      success: true,
      mode: "simulator",
      message: "Voice backend not configured — using browser simulator",
    }
  }
  const backendAgentId = AGENT_ID_MAP[agentId] || "03_sarah"
  try {
    const res = await fetch(`${VOICE_BACKEND_URL}/api/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Secret": VOICE_API_SECRET,
      },
      body: JSON.stringify({ agentId: backendAgentId, contacts, hotelData }),
    })
    if (!res.ok) throw new Error(`Backend ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return { ...data, mode: "real" }
  } catch (error) {
    return {
      success: false,
      mode: "error",
      message: "Voice backend unreachable — falling back to simulator",
      error: String(error),
    }
  }
}
