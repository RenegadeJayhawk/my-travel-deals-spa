import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CompareBar } from '../CompareBar';
import { useCompareSelection } from '../../context/CompareContext';
import type { TravelDeal } from '../../types/deals';

// Mock the context hook
vi.mock('../../context/CompareContext', () => ({
  useCompareSelection: vi.fn()
}));

const mockDeals: TravelDeal[] = [
  { id: '1', title: 'Deal 1' } as TravelDeal,
  { id: '2', title: 'Deal 2' } as TravelDeal,
];

describe('CompareBar', () => {
  it('does not render when no deals selected', () => {
    vi.mocked(useCompareSelection).mockReturnValue({
      selectedDeals: [],
      selectedDealIds: [],
      toggleCompare: vi.fn(),
      clearComparison: vi.fn(),
      isMaxSelected: false,
    });

    const { container } = render(
      <BrowserRouter>
        <CompareBar />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with selected deals', () => {
    vi.mocked(useCompareSelection).mockReturnValue({
      selectedDeals: mockDeals,
      selectedDealIds: ['1', '2'],
      toggleCompare: vi.fn(),
      clearComparison: vi.fn(),
      isMaxSelected: false,
    });

    render(
      <BrowserRouter>
        <CompareBar />
      </BrowserRouter>
    );

    expect(screen.getByText(/2 deals selected for comparison/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
    
    const compareBtn = screen.getByRole('button', { name: /Compare Now/i });
    expect(compareBtn).toBeInTheDocument();
    expect(compareBtn).not.toBeDisabled();
  });

  it('disables Compare Now button when only 1 deal selected', () => {
    vi.mocked(useCompareSelection).mockReturnValue({
      selectedDeals: [mockDeals[0]],
      selectedDealIds: ['1'],
      toggleCompare: vi.fn(),
      clearComparison: vi.fn(),
      isMaxSelected: false,
    });

    render(
      <BrowserRouter>
        <CompareBar />
      </BrowserRouter>
    );

    expect(screen.getByText(/1 deal selected for comparison/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare Now/i })).toBeDisabled();
  });
});
