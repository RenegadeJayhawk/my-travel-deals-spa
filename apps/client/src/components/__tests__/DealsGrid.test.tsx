import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DealsGrid } from '../DealsGrid';
import { dealsApi } from '../../services/api';
import type { FilterState } from '../../types/filters';

vi.mock('../../services/api', () => ({
  dealsApi: {
    getDeals: vi.fn(),
  },
  ApiError: class ApiError extends Error {}
}));

vi.mock('../DealCard', () => ({
  DealCard: ({ deal }: any) => <div data-testid="mock-deal-card">{deal.title}</div>
}));

vi.mock('../../services/alertChecker', () => ({
  AlertCheckerService: {
    checkAlerts: vi.fn()
  }
}));

const mockFilters: FilterState = {
  search: '',
  destination: '',
  minPrice: 0,
  maxPrice: 5000,
  dealType: '',
  sortBy: 'price-asc',
  startDate: '',
  endDate: '',
};

const mockDeals = [
  { id: '1', title: 'Paris Trip', destination: 'Paris', origin: 'NYC', price: 1000, qualityScore: 90, travelDates: { start: '2026-06-01' } },
  { id: '2', title: 'Tokyo Trip', destination: 'Tokyo', origin: 'LAX', price: 1500, qualityScore: 95, travelDates: { start: '2026-07-01' } },
];

describe('DealsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(dealsApi.getDeals).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<DealsGrid filters={mockFilters} />);
    expect(screen.getByText('Loading amazing travel deals...')).toBeInTheDocument();
  });

  it('renders error state on API failure', async () => {
    vi.mocked(dealsApi.getDeals).mockRejectedValue(new Error('API Error'));
    render(<DealsGrid filters={mockFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  it('renders empty state when no deals match', async () => {
    vi.mocked(dealsApi.getDeals).mockResolvedValue({ deals: [], total: 0, page: 1, pageSize: 10 });
    render(<DealsGrid filters={mockFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('No deals found')).toBeInTheDocument();
    });
  });

  it('renders deals when API succeeds', async () => {
    vi.mocked(dealsApi.getDeals).mockResolvedValue({ deals: mockDeals as any, total: 2, page: 1, pageSize: 10 });
    render(<DealsGrid filters={mockFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('2 deals available')).toBeInTheDocument();
    });
    
    const cards = screen.getAllByTestId('mock-deal-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Paris Trip');
  });

  it('applies client-side sort logic correctly', async () => {
    vi.mocked(dealsApi.getDeals).mockResolvedValue({ deals: mockDeals as any, total: 2, page: 1, pageSize: 10 });
    const descFilters = { ...mockFilters, sortBy: 'price-desc' as const };
    
    render(<DealsGrid filters={descFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('2 deals available')).toBeInTheDocument();
    });
    
    const cards = screen.getAllByTestId('mock-deal-card');
    expect(cards[0]).toHaveTextContent('Tokyo Trip'); // Tokyo is $1500, Paris is $1000
  });

  it('applies client-side search filtering correctly', async () => {
    vi.mocked(dealsApi.getDeals).mockResolvedValue({ deals: mockDeals as any, total: 2, page: 1, pageSize: 10 });
    const searchFilters = { ...mockFilters, search: 'paris' }; // Should only match Paris Trip
    
    render(<DealsGrid filters={searchFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('1 deal available')).toBeInTheDocument();
    });
    
    const cards = screen.getAllByTestId('mock-deal-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Paris Trip');
  });
});
