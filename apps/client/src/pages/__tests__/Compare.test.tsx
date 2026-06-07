import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Compare from '../Compare';
import { useCompareSelection } from '../../context/CompareContext';
import type { TravelDeal } from '../../types/deals';

vi.mock('../../context/CompareContext', () => ({
  useCompareSelection: vi.fn()
}));

const mockDeals: TravelDeal[] = [
  {
    id: '1',
    title: 'Paris Trip',
    destination: 'Paris',
    price: 1500,
    originalPrice: 2000,
    dealType: 'flight',
    provider: 'Air France',
    providerType: 'airline',
    qualityScore: 85,
    travelDates: { start: '2026-06-01T00:00:00Z', end: '2026-06-10T00:00:00Z' },
    inclusions: ['Flight'],
    url: 'http://example.com/1'
  } as TravelDeal,
  {
    id: '2',
    title: 'Tokyo Trip',
    destination: 'Tokyo',
    price: 1200,
    dealType: 'flight',
    provider: 'JAL',
    providerType: 'airline',
    qualityScore: 95,
    travelDates: { start: '2026-07-01T00:00:00Z', end: '2026-07-15T00:00:00Z' },
    inclusions: ['Flight', 'Baggage'],
    url: 'http://example.com/2'
  } as TravelDeal
];

describe('Compare Page', () => {
  it('renders empty state when no deals selected', () => {
    vi.mocked(useCompareSelection).mockReturnValue({
      selectedDeals: [],
      selectedDealIds: [],
      toggleCompare: vi.fn(),
      clearComparison: vi.fn(),
      isMaxSelected: false,
    });

    render(
      <BrowserRouter>
        <Compare />
      </BrowserRouter>
    );

    expect(screen.getByText(/No Deals Selected/i)).toBeInTheDocument();
  });

  it('renders comparison table with deals', () => {
    vi.mocked(useCompareSelection).mockReturnValue({
      selectedDeals: mockDeals,
      selectedDealIds: ['1', '2'],
      toggleCompare: vi.fn(),
      clearComparison: vi.fn(),
      isMaxSelected: false,
    });

    render(
      <BrowserRouter>
        <Compare />
      </BrowserRouter>
    );

    expect(screen.getByText('Compare Deals')).toBeInTheDocument();
    
    // Check titles
    expect(screen.getByText('Paris Trip')).toBeInTheDocument();
    expect(screen.getByText('Tokyo Trip')).toBeInTheDocument();
    
    // Check prices
    expect(screen.getByText(/\$1500/)).toBeInTheDocument();
    expect(screen.getByText(/\$1200/)).toBeInTheDocument();
    
    // Check best values
    // lowest price
    expect(screen.getByText(/\$1200/)).toHaveClass('best-value');
    // highest quality score
    expect(screen.getByText(/95%/)).toHaveClass('best-value');
  });
});
