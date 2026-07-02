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
  private apiKey: string;
  private apiSecret: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(apiKey?: string, apiSecret?: string) {
    this.apiKey = apiKey || '';
    this.apiSecret = apiSecret || '';
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    if (!this.apiKey || !this.apiSecret || this.apiKey === 'your_amadeus_api_key_here') {
      throw new Error('Missing or invalid Amadeus API keys');
    }

    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.apiSecret}`
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Amadeus');
    }

    const data = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 5000;
    return this.token;
  }

  async getDeals(
    filters?: DealsFilter,
    page = 1,
    pageSize = 20
  ): Promise<DealsResponse> {
    try {
      const token = await this.getAccessToken();
      
      const originCode = 'NYC'; 
      const destCode = 'PAR';
      const date = '2026-06-15';
      
      const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destCode}&departureDate=${date}&adults=1&max=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Amadeus');
      }

      const data = await response.json();
      
      const realDeals: TravelDeal[] = data.data.map((offer: any, index: number) => ({
        id: `amadeus-${offer.id}`,
        title: `Flight to Paris`,
        destination: 'Paris, France',
        origin: 'New York, NY',
        price: parseFloat(offer.price.total),
        originalPrice: parseFloat(offer.price.total) + 150,
        currency: offer.price.currency,
        travelDates: {
          start: date,
          end: date,
        },
        bookingDeadline: '2026-06-01',
        dealType: 'flight',
        provider: offer.validatingAirlineCodes[0] || 'Airline',
        providerType: 'airline',
        qualityScore: 85 + index,
        inclusions: ['Flight'],
        restrictions: ['Non-refundable'],
        url: 'https://example.com/book',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const startIndex = (page - 1) * pageSize;
      const paginatedDeals = realDeals.slice(startIndex, startIndex + pageSize);

      return {
        deals: paginatedDeals,
        total: realDeals.length,
        page,
        pageSize,
      }
    } catch (error) {
      console.log('Falling back to mock data:', (error as Error).message);
      
      let filteredDeals = [...mockDeals];

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

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

      return {
        deals: paginatedDeals,
        total: filteredDeals.length,
        page,
        pageSize,
      }
    }
  }

  async getDealById(id: string): Promise<TravelDeal | null> {
    const deal = mockDeals.find((d) => d.id === id);
    return deal || null;
  }
}
