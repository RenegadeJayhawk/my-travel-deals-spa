import { TravelDeal } from './deals'

/**
 * Saved Deal - represents a bookmarked travel deal
 */
export interface SavedDeal {
  id: string // Unique identifier for the saved deal
  deal: TravelDeal // Full deal data
  savedAt: string // ISO timestamp when deal was saved
  notes?: string // Optional user notes about the deal
  expiresAt?: string // Optional expiration date (deal booking deadline)
}

/**
 * Saved Deals Service Response
 */
export interface SavedDealsResponse {
  deals: SavedDeal[]
  total: number
}
