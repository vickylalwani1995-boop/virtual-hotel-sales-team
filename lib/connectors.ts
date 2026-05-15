export type ConnectorStatus = "connected" | "available" | "premium"
export type ConnectorCategory =
  | "Data Provider"
  | "CRM & Outreach"
  | "Calling & Telephony"
  | "Intelligence"
  | "Maps & Location"

export interface Connector {
  id: string
  name: string
  category: ConnectorCategory
  description: string
  color: string
  icon: string
  status: ConnectorStatus
  capabilities: string[]
  pricing: string
  featured?: boolean
}

export const CONNECTORS: Connector[] = [
  // DATA PROVIDERS (6)
  {
    id: "apollo",
    name: "Apollo.io",
    category: "Data Provider",
    description: "275M+ verified contacts. Email + direct dial enrichment.",
    color: "#0070D2",
    icon: "Database",
    status: "connected",
    capabilities: ["Email finder", "Direct dial", "Company data", "Buyer intent"],
    pricing: "Premium plan: $99–$499/mo",
  },
  {
    id: "vibe-prospecting",
    name: "Vibe Prospecting",
    category: "Data Provider",
    description: "Real-time business + prospect data. Best for B2B firmographics.",
    color: "#7C3AED",
    icon: "Zap",
    status: "connected",
    capabilities: ["Firmographics", "Technographics", "Funding data", "Org charts"],
    pricing: "Credit-based",
  },
  {
    id: "zoominfo",
    name: "ZoomInfo",
    category: "Data Provider",
    description: "Enterprise-grade B2B database. The gold standard.",
    color: "#FF6B35",
    icon: "Search",
    status: "available",
    capabilities: ["100M+ contacts", "Intent data", "Org charts", "Tech stack"],
    pricing: "Enterprise: $15K+/yr",
  },
  {
    id: "clay",
    name: "Clay",
    category: "Data Provider",
    description: "Multi-source waterfall enrichment. Combines 50+ databases.",
    color: "#FF4D00",
    icon: "Layers",
    status: "available",
    capabilities: ["Waterfall enrichment", "Custom workflows", "AI research", "Webhooks"],
    pricing: "Starter: $149/mo",
  },
  {
    id: "lusha",
    name: "Lusha",
    category: "Data Provider",
    description: "Direct dials and verified emails. Strong in EMEA + APAC.",
    color: "#10B981",
    icon: "PhoneCall",
    status: "available",
    capabilities: ["Direct dials", "Mobile numbers", "Email finder", "Bulk enrichment"],
    pricing: "Pro: $79–$199/mo",
  },
  {
    id: "rocketreach",
    name: "RocketReach",
    category: "Data Provider",
    description: "700M+ profiles with email + phone. Good Chrome extension.",
    color: "#1E40AF",
    icon: "Send",
    status: "available",
    capabilities: ["Email finder", "Phone numbers", "LinkedIn lookup", "Bulk lists"],
    pricing: "Essentials: $80/mo",
  },
  // CRM & OUTREACH (4)
  {
    id: "inntelligent",
    name: "Inntelligent CRM",
    category: "CRM & Outreach",
    description: "Native hospitality CRM. The data spine for hotel sales teams.",
    color: "#0F4C81",
    icon: "Building2",
    status: "connected",
    capabilities: ["Lead sync", "Deal pipeline", "Activity logging", "Reporting"],
    pricing: "Included with MHSP partnership",
    featured: true,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM & Outreach",
    description: "Marketing automation + CRM. Free tier available.",
    color: "#FF7A59",
    icon: "Settings2",
    status: "available",
    capabilities: ["Email sequences", "Deal tracking", "Marketing automation", "Reports"],
    pricing: "Free / Starter $20/mo",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM & Outreach",
    description: "Enterprise CRM standard. Heavy customization.",
    color: "#00A1E0",
    icon: "Cloud",
    status: "available",
    capabilities: ["Full CRM", "Custom objects", "Workflow automation", "Reports"],
    pricing: "Sales Cloud: $25–$330/user/mo",
  },
  {
    id: "smartlead",
    name: "Smartlead.ai",
    category: "CRM & Outreach",
    description: "Cold email sending at scale. Unlimited inboxes.",
    color: "#6366F1",
    icon: "Mail",
    status: "available",
    capabilities: ["Email sequences", "Inbox rotation", "Deliverability", "A/B testing"],
    pricing: "Basic: $39/mo",
  },
  // CALLING & TELEPHONY (3)
  {
    id: "livekit",
    name: "LiveKit + Twilio",
    category: "Calling & Telephony",
    description: "Real-time voice calling infrastructure. AI agents on real phones.",
    color: "#FF4444",
    icon: "Phone",
    status: "connected",
    capabilities: ["Inbound + outbound", "SIP trunking", "Voice AI", "Call recording"],
    pricing: "$0.013/min + $7/mo hosting",
  },
  {
    id: "switchboard",
    name: "Switchboard",
    category: "Calling & Telephony",
    description: "Modern telephony for call centers. Smart routing.",
    color: "#FB923C",
    icon: "GitBranch",
    status: "available",
    capabilities: ["Multi-number routing", "Call analytics", "IVR builder", "Voicemail-to-text"],
    pricing: "Contact sales",
  },
  {
    id: "aircall",
    name: "Aircall",
    category: "Calling & Telephony",
    description: "Cloud-based business phone. CRM integrations built in.",
    color: "#00B388",
    icon: "Mic",
    status: "available",
    capabilities: ["Click-to-call", "Call recording", "Power dialer", "CRM sync"],
    pricing: "Essentials: $30/user/mo",
  },
  // MAPS & LOCATION (6)
  {
    id: "google-maps",
    name: "Google Maps Places API",
    category: "Maps & Location",
    description: "200M+ places worldwide. Names, addresses, hours, ratings, photos.",
    color: "#4285F4",
    icon: "MapPin",
    status: "connected",
    capabilities: ["Place search by radius", "Business categories (50+ types)", "Phone + website + hours", "Reviews & ratings", "Photos", "Business status (open/closed permanently)"],
    pricing: "Pay-per-call: $17 per 1K requests after free tier",
    featured: true,
  },
  {
    id: "bing-maps",
    name: "Bing Maps API",
    category: "Maps & Location",
    description: "Microsoft's maps. Strong for B2B and corporate office data.",
    color: "#008373",
    icon: "Globe",
    status: "available",
    capabilities: ["Local business search", "Geocoding & reverse geocoding", "Isochrone (drive-time polygons)", "Routing & distance matrix"],
    pricing: "Basic: free up to 125K transactions/yr",
  },
  {
    id: "apple-maps-connect",
    name: "Apple Maps Connect (MapKit JS)",
    category: "Maps & Location",
    description: "Apple's business directory. Strong for premium US business listings.",
    color: "#1D1D1F",
    icon: "MapPin",
    status: "available",
    capabilities: ["Place lookup", "Business categories", "iOS-native display", "Privacy-first (no user tracking)"],
    pricing: "Free for low volume",
  },
  {
    id: "openstreetmap",
    name: "OpenStreetMap Overpass",
    category: "Maps & Location",
    description: "Open-source maps. Free unlimited. Great for tagged amenities.",
    color: "#7EBC6F",
    icon: "Globe",
    status: "available",
    capabilities: ["Free unlimited queries", "Tagged amenities (hospitals, schools, hotels, offices)", "Polygon-based area queries", "Community-maintained data"],
    pricing: "Free (rate-limited fair use)",
  },
  {
    id: "yelp",
    name: "Yelp Fusion API",
    category: "Maps & Location",
    description: "Local business reviews & sentiment. Great for event venues + dining.",
    color: "#D32323",
    icon: "Star",
    status: "available",
    capabilities: ["Business search by radius + category", "Reviews + sentiment text", "Photos + hours", "Price tier ($-$$$$)", "Featured event venues"],
    pricing: "Free up to 5K/day",
  },
  {
    id: "foursquare",
    name: "Foursquare Places",
    category: "Maps & Location",
    description: "100M+ POIs. Best for footfall data and visit patterns.",
    color: "#F94877",
    icon: "MapPin",
    status: "available",
    capabilities: ["Places search", "Foot traffic data", "Category taxonomy (1000+ types)", "Visit patterns by time-of-day"],
    pricing: "Starter: $200/mo for 100K calls",
  },
  // INTELLIGENCE & ENRICHMENT (2)
  {
    id: "google-my-business",
    name: "Google My Business",
    category: "Intelligence",
    description: "Local business data for backyard hustle. Free + reliable.",
    color: "#4285F4",
    icon: "MapPin",
    status: "available",
    capabilities: ["Local listings", "Reviews", "Hours", "Business categories"],
    pricing: "Free API",
  },
  {
    id: "linkedin-sales-nav",
    name: "LinkedIn Sales Navigator",
    category: "Intelligence",
    description: "Decision-maker discovery. Account-based prospecting.",
    color: "#0A66C2",
    icon: "Briefcase",
    status: "available",
    capabilities: ["Advanced search", "InMail", "Saved leads", "Account insights"],
    pricing: "Core: $99/mo",
  },
]

const ALWAYS_CONNECTED = new Set(["apollo", "vibe-prospecting", "inntelligent", "livekit", "google-maps"])
const STORAGE_KEY = "connectors_state"

export function loadConnectorState(): Record<string, ConnectorStatus> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveConnectorState(state: Record<string, ConnectorStatus>) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getEffectiveStatus(
  connector: Connector,
  overrides: Record<string, ConnectorStatus>,
  demoMode = false,
): ConnectorStatus {
  if (demoMode) return "connected"
  if (ALWAYS_CONNECTED.has(connector.id) && !overrides[connector.id]) return "connected"
  return overrides[connector.id] ?? connector.status
}
