import { SavedDeal } from '../types/savedDeals'
import { TravelDeal } from '../types/deals'

const STORAGE_KEY = 'savedDeals'

/**
 * Service for managing saved deals in LocalStorage
 */
export class SavedDealsService {
  /**
   * Get all saved deals, sorted by saved date (newest first)
   */
  static getAll(): SavedDeal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const deals: SavedDeal[] = JSON.parse(data)
      return deals.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    } catch (error) {
      console.error('Error loading saved deals:', error)
      return []
    }
  }

  /**
   * Check if a deal is already saved
   */
  static isSaved(dealId: string): boolean {
    const deals = this.getAll()
    return deals.some((saved) => saved.deal.id === dealId)
  }

  /**
   * Save a deal
   */
  static save(deal: TravelDeal, notes?: string): SavedDeal {
    try {
      // Check if already saved
      if (this.isSaved(deal.id)) {
        throw new Error('Deal is already saved')
      }

      const deals = this.getAll()
      const savedDeal: SavedDeal = {
        id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        deal,
        savedAt: new Date().toISOString(),
        notes,
        expiresAt: deal.bookingDeadline,
      }

      deals.push(savedDeal)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deals))

      return savedDeal
    } catch (error) {
      console.error('Error saving deal:', error)
      throw error
    }
  }

  /**
   * Unsave a deal by deal ID
   */
  static unsave(dealId: string): boolean {
    try {
      const deals = this.getAll()
      const filtered = deals.filter((saved) => saved.deal.id !== dealId)

      if (filtered.length === deals.length) {
        return false // Deal was not found
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Error unsaving deal:', error)
      return false
    }
  }

  /**
   * Update notes for a saved deal
   */
  static updateNotes(dealId: string, notes: string): boolean {
    try {
      const deals = this.getAll()
      const deal = deals.find((saved) => saved.deal.id === dealId)

      if (!deal) {
        return false
      }

      deal.notes = notes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deals))
      return true
    } catch (error) {
      console.error('Error updating notes:', error)
      return false
    }
  }

  /**
   * Get saved deal by deal ID
   */
  static getByDealId(dealId: string): SavedDeal | null {
    const deals = this.getAll()
    return deals.find((saved) => saved.deal.id === dealId) || null
  }

  /**
   * Delete a saved deal by saved deal ID
   */
  static delete(savedDealId: string): boolean {
    try {
      const deals = this.getAll()
      const filtered = deals.filter((saved) => saved.id !== savedDealId)

      if (filtered.length === deals.length) {
        return false // Deal was not found
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Error deleting saved deal:', error)
      return false
    }
  }

  /**
   * Get count of saved deals
   */
  static getCount(): number {
    return this.getAll().length
  }

  /**
   * Check if any saved deals are expired
   */
  static getExpiredDeals(): SavedDeal[] {
    const deals = this.getAll()
    const now = new Date()

    return deals.filter((saved) => {
      if (!saved.expiresAt) return false
      return new Date(saved.expiresAt) < now
    })
  }

  /**
   * Remove expired deals
   */
  static removeExpired(): number {
    try {
      const deals = this.getAll()
      const now = new Date()

      const filtered = deals.filter((saved) => {
        if (!saved.expiresAt) return true
        return new Date(saved.expiresAt) >= now
      })

      const removedCount = deals.length - filtered.length

      if (removedCount > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      }

      return removedCount
    } catch (error) {
      console.error('Error removing expired deals:', error)
      return 0
    }
  }

  /**
   * Clear all saved deals
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing saved deals:', error)
    }
  }
}
