import { TravelDeal, DealsFilter, DealsResponse } from '../types'

/**
 * Database Service for Cloudflare D1
 * Provides data access layer with parameterized queries for security (OWASP A03)
 */
export class DatabaseService {
  private db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  /**
   * Fetch travel deals with optional filtering and pagination
   * Uses parameterized queries to prevent SQL injection
   */
  async getDeals(
    filters?: DealsFilter,
    page = 1,
    pageSize = 20
  ): Promise<DealsResponse> {
    try {
      // Build WHERE clause with parameterized queries
      const conditions: string[] = []
      const params: any[] = []

      if (filters?.destination) {
        conditions.push('destination LIKE ?')
        params.push(`%${filters.destination}%`)
      }

      if (filters?.origin) {
        conditions.push('origin LIKE ?')
        params.push(`%${filters.origin}%`)
      }

      if (filters?.minPrice !== undefined) {
        conditions.push('price >= ?')
        params.push(filters.minPrice)
      }

      if (filters?.maxPrice !== undefined) {
        conditions.push('price <= ?')
        params.push(filters.maxPrice)
      }

      if (filters?.dealType) {
        conditions.push('deal_type = ?')
        params.push(filters.dealType)
      }

      if (filters?.providerType) {
        conditions.push('provider_type = ?')
        params.push(filters.providerType)
      }

      if (filters?.startDate) {
        conditions.push('travel_start_date >= ?')
        params.push(filters.startDate)
      }

      if (filters?.endDate) {
        conditions.push('travel_end_date <= ?')
        params.push(filters.endDate)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM travel_deals ${whereClause}`
      const countResult = await this.db.prepare(countQuery).bind(...params).first<{ total: number }>()
      const total = countResult?.total || 0

      // Get paginated results
      const offset = (page - 1) * pageSize
      const dataQuery = `
        SELECT * FROM travel_deals 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
      const results = await this.db
        .prepare(dataQuery)
        .bind(...params, pageSize, offset)
        .all<any>()

      // Transform database rows to TravelDeal objects
      const deals: TravelDeal[] = results.results.map((row) => this.rowToTravelDeal(row))

      return {
        deals,
        total,
        page,
        pageSize,
      }
    } catch (error) {
      console.error('Database error in getDeals:', error)
      throw new Error('Failed to fetch deals from database')
    }
  }

  /**
   * Get a single deal by ID
   * Uses parameterized query to prevent SQL injection
   */
  async getDealById(id: string): Promise<TravelDeal | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM travel_deals WHERE id = ?')
        .bind(id)
        .first<any>()

      if (!result) {
        return null
      }

      return this.rowToTravelDeal(result)
    } catch (error) {
      console.error('Database error in getDealById:', error)
      throw new Error('Failed to fetch deal from database')
    }
  }

  /**
   * Transform database row to TravelDeal object
   * Handles JSON parsing for inclusions and restrictions
   */
  private rowToTravelDeal(row: any): TravelDeal {
    return {
      id: row.id,
      title: row.title,
      destination: row.destination,
      origin: row.origin,
      price: row.price,
      originalPrice: row.original_price,
      currency: row.currency,
      travelDates: {
        start: row.travel_start_date,
        end: row.travel_end_date,
      },
      bookingDeadline: row.booking_deadline,
      dealType: row.deal_type,
      provider: row.provider,
      providerType: row.provider_type,
      qualityScore: row.quality_score,
      inclusions: JSON.parse(row.inclusions),
      restrictions: row.restrictions ? JSON.parse(row.restrictions) : undefined,
      url: row.url,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  /**
   * Insert a new travel deal
   * Uses parameterized query to prevent SQL injection
   */
  async createDeal(deal: Omit<TravelDeal, 'createdAt' | 'updatedAt'>): Promise<TravelDeal> {
    try {
      const query = `
        INSERT INTO travel_deals (
          id, title, destination, origin, price, original_price, currency,
          travel_start_date, travel_end_date, booking_deadline,
          deal_type, provider, provider_type, quality_score,
          inclusions, restrictions, url, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      await this.db
        .prepare(query)
        .bind(
          deal.id,
          deal.title,
          deal.destination,
          deal.origin,
          deal.price,
          deal.originalPrice || null,
          deal.currency,
          deal.travelDates.start,
          deal.travelDates.end,
          deal.bookingDeadline,
          deal.dealType,
          deal.provider,
          deal.providerType,
          deal.qualityScore,
          JSON.stringify(deal.inclusions),
          deal.restrictions ? JSON.stringify(deal.restrictions) : null,
          deal.url,
          deal.imageUrl || null
        )
        .run()

      // Fetch the created deal
      const created = await this.getDealById(deal.id)
      if (!created) {
        throw new Error('Failed to retrieve created deal')
      }

      return created
    } catch (error) {
      console.error('Database error in createDeal:', error)
      throw new Error('Failed to create deal in database')
    }
  }

  /**
   * Update an existing travel deal
   * Uses parameterized query to prevent SQL injection
   */
  async updateDeal(
    id: string,
    updates: Partial<Omit<TravelDeal, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<TravelDeal | null> {
    try {
      const setClauses: string[] = []
      const params: any[] = []

      // Build SET clause dynamically based on provided updates
      if (updates.title !== undefined) {
        setClauses.push('title = ?')
        params.push(updates.title)
      }
      if (updates.destination !== undefined) {
        setClauses.push('destination = ?')
        params.push(updates.destination)
      }
      if (updates.origin !== undefined) {
        setClauses.push('origin = ?')
        params.push(updates.origin)
      }
      if (updates.price !== undefined) {
        setClauses.push('price = ?')
        params.push(updates.price)
      }
      // Add more fields as needed...

      if (setClauses.length === 0) {
        return this.getDealById(id)
      }

      setClauses.push('updated_at = datetime("now")')

      const query = `
        UPDATE travel_deals 
        SET ${setClauses.join(', ')}
        WHERE id = ?
      `

      params.push(id)

      await this.db.prepare(query).bind(...params).run()

      return this.getDealById(id)
    } catch (error) {
      console.error('Database error in updateDeal:', error)
      throw new Error('Failed to update deal in database')
    }
  }

  /**
   * Delete a travel deal
   * Uses parameterized query to prevent SQL injection
   */
  async deleteDeal(id: string): Promise<boolean> {
    try {
      const result = await this.db.prepare('DELETE FROM travel_deals WHERE id = ?').bind(id).run()

      return result.success
    } catch (error) {
      console.error('Database error in deleteDeal:', error)
      throw new Error('Failed to delete deal from database')
    }
  }
}
