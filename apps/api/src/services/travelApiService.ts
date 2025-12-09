import { TravelDeal, DealsFilter, DealsResponse } from '../types'

// Stubbed mock data for MVP development
const mockDeals: TravelDeal[] = [
  {
    id: '1',
    title: 'Cancun All-Inclusive Paradise',
    destination: 'Cancun, Mexico',
    origin: 'New York, NY',
    price: 899,
    originalPrice: 1299,
    currency: 'USD',
    travelDates: {
      start: '2025-03-15',
      end: '2025-03-22',
    },
    bookingDeadline: '2025-02-15',
    dealType: 'all-inclusive',
    provider: 'Expedia',
    providerType: 'ota',
    qualityScore: 95,
    inclusions: ['Flights', 'Hotel', 'All Meals', 'Drinks', 'Airport Transfer'],
    restrictions: ['Non-refundable', 'Minimum 2 adults'],
    url: 'https://example.com/deal/1',
    imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Paris City Break',
    destination: 'Paris, France',
    origin: 'London, UK',
    price: 1299,
    originalPrice: 1799,
    currency: 'USD',
    travelDates: {
      start: '2025-04-01',
      end: '2025-04-05',
    },
    bookingDeadline: '2025-03-01',
    dealType: 'package',
    provider: 'Booking.com',
    providerType: 'ota',
    qualityScore: 92,
    inclusions: ['Flights', 'Hotel', 'Breakfast', 'City Tour'],
    url: 'https://example.com/deal/2',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Tokyo Adventure Package',
    destination: 'Tokyo, Japan',
    origin: 'Los Angeles, CA',
    price: 1899,
    originalPrice: 2599,
    currency: 'USD',
    travelDates: {
      start: '2025-05-10',
      end: '2025-05-20',
    },
    bookingDeadline: '2025-04-10',
    dealType: 'package',
    provider: 'Japan Airlines',
    providerType: 'airline',
    qualityScore: 98,
    inclusions: ['Flights', 'Hotel', 'JR Pass', 'Airport Transfer'],
    url: 'https://example.com/deal/3',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Stubbed Travel API Service
 * This service provides mock data for MVP development.
 * In production, replace with real API integration (Amadeus, Skyscanner, etc.)
 */
export class TravelApiService {
  /**
   * Fetch travel deals with optional filtering
   * @param filters - Optional filters to apply to the deals
   * @param page - Page number for pagination
   * @param pageSize - Number of deals per page
   * @returns Promise with deals response
   */
  async getDeals(
    filters?: DealsFilter,
    page = 1,
    pageSize = 20
  ): Promise<DealsResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    let filteredDeals = [...mockDeals]

    // Apply filters
    if (filters) {
      if (filters.destination) {
        filteredDeals = filteredDeals.filter((deal) =>
          deal.destination.toLowerCase().includes(filters.destination!.toLowerCase())
        )
      }
      if (filters.origin) {
        filteredDeals = filteredDeals.filter((deal) =>
          deal.origin.toLowerCase().includes(filters.origin!.toLowerCase())
        )
      }
      if (filters.minPrice !== undefined) {
        filteredDeals = filteredDeals.filter((deal) => deal.price >= filters.minPrice!)
      }
      if (filters.maxPrice !== undefined) {
        filteredDeals = filteredDeals.filter((deal) => deal.price <= filters.maxPrice!)
      }
      if (filters.dealType) {
        filteredDeals = filteredDeals.filter((deal) => deal.dealType === filters.dealType)
      }
      if (filters.providerType) {
        filteredDeals = filteredDeals.filter(
          (deal) => deal.providerType === filters.providerType
        )
      }
    }

    // Pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedDeals = filteredDeals.slice(startIndex, endIndex)

    return {
      deals: paginatedDeals,
      total: filteredDeals.length,
      page,
      pageSize,
    }
  }

  /**
   * Get a single deal by ID
   * @param id - Deal ID
   * @returns Promise with the deal or null if not found
   */
  async getDealById(id: string): Promise<TravelDeal | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 50))

    const deal = mockDeals.find((d) => d.id === id)
    return deal || null
  }
}
