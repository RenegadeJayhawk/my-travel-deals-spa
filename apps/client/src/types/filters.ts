export interface FilterState {
  search: string;
  destination: string;
  minPrice: number;
  maxPrice: number;
  startDate: string;
  endDate: string;
  dealType: string;
  sortBy: string;
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  destination: '',
  minPrice: 0,
  maxPrice: 5000,
  startDate: '',
  endDate: '',
  dealType: '',
  sortBy: 'price-asc',
};

export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'quality-desc', label: 'Quality: High to Low' },
  { value: 'date-asc', label: 'Date: Soonest First' },
];

export const DEAL_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'package', label: 'Package' },
  { value: 'flight', label: 'Flight Only' },
  { value: 'hotel', label: 'Hotel Only' },
  { value: 'all-inclusive', label: 'All-Inclusive' },
];

export interface SavedSearch {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
  lastUsed?: string;
}
