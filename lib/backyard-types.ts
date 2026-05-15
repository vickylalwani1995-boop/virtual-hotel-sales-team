export interface BusinessQualification {
  score: number
  tier: "Hot" | "Warm" | "Cold" | "Disqualified"
  annualRoomNights: number
  estimatedRevenue: string
  decisionMakerTitle: string
  reasonForScore: string
  nextAction: string
}

export interface FeatureBusiness {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  distanceMiles: number
  googleRating: number
  googleReviews: number
  website: string
  phone: string
  address: string
  businessStatus: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY"
  categoryDetails: string[]
  qualification: BusinessQualification
}
