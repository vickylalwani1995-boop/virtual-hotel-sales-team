import type { FeatureBusiness } from "./backyard-types"

export const HOTEL_LAT = 32.7767
export const HOTEL_LNG = -96.797
export const HOTEL_NAME = "The Westmore Dallas"

export const TIER_CONFIG = {
  Hot:          { min: 8,   color: "#DC2626", bg: "bg-red-100",    text: "text-red-700",    badge: "bg-red-600 text-white" },
  Warm:         { min: 6,   color: "#F59E0B", bg: "bg-amber-100",  text: "text-amber-700",  badge: "bg-amber-500 text-white" },
  Cold:         { min: 4,   color: "#3B82F6", bg: "bg-blue-100",   text: "text-blue-700",   badge: "bg-blue-500 text-white" },
  Disqualified: { min: 0,   color: "#9CA3AF", bg: "bg-gray-100",   text: "text-gray-500",   badge: "bg-gray-400 text-white" },
} as const

export type Tier = keyof typeof TIER_CONFIG

export function getTier(score: number): Tier {
  if (score >= 8) return "Hot"
  if (score >= 6) return "Warm"
  if (score >= 4) return "Cold"
  return "Disqualified"
}

export function getTierColor(tier: Tier): string {
  return TIER_CONFIG[tier].color
}

export const CATEGORIES = [
  { id: "healthcare",    label: "Healthcare & Medical" },
  { id: "corporate",    label: "Corporate & Finance" },
  { id: "universities", label: "Universities & Education" },
  { id: "event_venues", label: "Event Venues" },
  { id: "government",   label: "Government & Non-profit" },
  { id: "sports",       label: "Sports & Entertainment" },
  { id: "tech",         label: "Tech & Innovation" },
  { id: "hospitality",  label: "Hospitality & Tourism" },
] as const

export type Category = (typeof CATEGORIES)[number]["id"]

export async function loadScanResults(): Promise<FeatureBusiness[]> {
  const res = await fetch("/api/backyard-scan")
  if (!res.ok) throw new Error("Failed to load scan results")
  const json = await res.json()
  return json.businesses as FeatureBusiness[]
}

export function filterByCategory(businesses: FeatureBusiness[], cats: Category[]): FeatureBusiness[] {
  if (cats.length === 0) return businesses
  return businesses.filter((b) => cats.includes(b.category as Category))
}

export function filterByRadius(businesses: FeatureBusiness[], radiusMiles: number): FeatureBusiness[] {
  return businesses.filter((b) => b.distanceMiles <= radiusMiles)
}

export function sortByScore(businesses: FeatureBusiness[]): FeatureBusiness[] {
  return [...businesses].sort((a, b) => b.qualification.score - a.qualification.score)
}
