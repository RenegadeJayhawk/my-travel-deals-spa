export interface TravelDeal {
  id: string;
  title: string;
  destination: string;
  origin: string;
  price: number;
  originalPrice?: number;
  currency: string;
  travelDates: {
    start: string;
    end: string;
  };
  bookingDeadline: string;
  dealType: 'flight' | 'hotel' | 'package' | 'cruise' | 'all-inclusive';
  provider: string;
  providerType: 'airline' | 'hotel' | 'ota' | 'cruise-line' | 'tour-operator';
  qualityScore: number;
  inclusions: string[];
  restrictions?: string[];
  url: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealsResponse {
  deals: TravelDeal[];
  total: number;
  page: number;
  pageSize: number;
}
