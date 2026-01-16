import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DealCard } from '../DealCard';
import { SavedDealsService } from '../../services/savedDeals';
import { createMockDeal } from '../../test/utils';

// Mock SavedDealsService
vi.mock('../../services/savedDeals', () => ({
  SavedDealsService: {
    isSaved: vi.fn(),
    save: vi.fn(),
    unsave: vi.fn(),
  },
}));

describe('DealCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (SavedDealsService.isSaved as any).mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('should render deal title', () => {
      const deal = createMockDeal({ title: 'Amazing Paris Vacation' });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('Amazing Paris Vacation')).toBeInTheDocument();
    });

    it('should render deal destination', () => {
      const deal = createMockDeal({ destination: 'Paris, France' });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    });

    it('should render deal type', () => {
      const deal = createMockDeal({ dealType: 'all-inclusive' });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('all-inclusive')).toBeInTheDocument();
    });

    it('should render current price', () => {
      const deal = createMockDeal({ price: 1299 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('$1299')).toBeInTheDocument();
    });

    it('should render original price when provided', () => {
      const deal = createMockDeal({ price: 1299, originalPrice: 1999 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('$1999')).toBeInTheDocument();
    });

    it('should not render original price when not provided', () => {
      const deal = createMockDeal({ price: 1299, originalPrice: undefined });
      render(<DealCard deal={deal} />);

      expect(screen.queryByText(/\$\d+/)).toBeInTheDocument(); // Current price exists
      const { container } = render(<DealCard deal={deal} />);
      expect(container.querySelector('.deal-card-original-price')).not.toBeInTheDocument();
    });

    it('should render provider name', () => {
      const deal = createMockDeal({ provider: 'TravelDeals.com' });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('TravelDeals.com')).toBeInTheDocument();
    });

    it('should render quality score', () => {
      const deal = createMockDeal({ qualityScore: 95 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText(/95% Quality/)).toBeInTheDocument();
    });

    it('should render image with correct alt text', () => {
      const deal = createMockDeal({
        title: 'Beach Resort',
        imageUrl: 'https://example.com/beach.jpg',
      });
      render(<DealCard deal={deal} />);

      const image = screen.getByAltText('Beach Resort');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/beach.jpg');
    });

    it('should render image with lazy loading', () => {
      const deal = createMockDeal({ imageUrl: 'https://example.com/image.jpg' });
      render(<DealCard deal={deal} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('should not render image section when imageUrl is not provided', () => {
      const deal = createMockDeal({ imageUrl: undefined });
      render(<DealCard deal={deal} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Savings Badge', () => {
    it('should calculate and display savings percentage', () => {
      const deal = createMockDeal({ price: 1000, originalPrice: 2000 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('Save 50%')).toBeInTheDocument();
    });

    it('should round savings percentage', () => {
      const deal = createMockDeal({ price: 1333, originalPrice: 2000 });
      render(<DealCard deal={deal} />);

      // (2000 - 1333) / 2000 = 0.3335 = 33.35% -> rounds to 33%
      expect(screen.getByText('Save 33%')).toBeInTheDocument();
    });

    it('should not display savings badge when no original price', () => {
      const deal = createMockDeal({ price: 1000, originalPrice: undefined });
      render(<DealCard deal={deal} />);

      expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();
    });

    it('should not display savings badge when savings is 0%', () => {
      const deal = createMockDeal({ price: 1000, originalPrice: 1000 });
      render(<DealCard deal={deal} />);

      expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();
    });
  });

  describe('Travel Dates', () => {
    it('should format and display travel dates', () => {
      const deal = createMockDeal({
        travelDates: {
          start: '2026-06-01',
          end: '2026-06-15',
        },
      });
      render(<DealCard deal={deal} />);

      // Check that dates are displayed (format may vary by locale)
      const dateText = screen.getByText(/2026/);
      expect(dateText.textContent).toContain('2026');
    });

    it('should display dates with correct format', () => {
      const deal = createMockDeal({
        travelDates: {
          start: '2026-12-25',
          end: '2027-01-05',
        },
      });
      render(<DealCard deal={deal} />);

      // Check that dates are displayed (format may vary by locale)
      const dateText = screen.getByText(/Dec/);
      expect(dateText.textContent).toMatch(/Dec.*2026.*Jan.*2027/);
    });
  });

  describe('Inclusions', () => {
    it('should display first 3 inclusions', () => {
      const deal = createMockDeal({
        inclusions: ['Hotel', 'Flights', 'Breakfast', 'Airport Transfer'],
      });
      render(<DealCard deal={deal} />);

      expect(screen.getByText(/Hotel/)).toBeInTheDocument();
      expect(screen.getByText(/Flights/)).toBeInTheDocument();
      expect(screen.getByText(/Breakfast/)).toBeInTheDocument();
    });

    it('should show "+X more" when more than 3 inclusions', () => {
      const deal = createMockDeal({
        inclusions: ['Hotel', 'Flights', 'Breakfast', 'Lunch', 'Dinner'],
      });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('should not show "+X more" when exactly 3 inclusions', () => {
      const deal = createMockDeal({
        inclusions: ['Hotel', 'Flights', 'Breakfast'],
      });
      render(<DealCard deal={deal} />);

      expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
    });

    it('should not show "+X more" when less than 3 inclusions', () => {
      const deal = createMockDeal({
        inclusions: ['Hotel', 'Flights'],
      });
      render(<DealCard deal={deal} />);

      expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
    });

    it('should display inclusions with checkmark', () => {
      const deal = createMockDeal({
        inclusions: ['Hotel'],
      });
      render(<DealCard deal={deal} />);

      expect(screen.getByText(/✓ Hotel/)).toBeInTheDocument();
    });
  });

  describe('View Deal Link', () => {
    it('should render link with correct href', () => {
      const deal = createMockDeal({ url: 'https://example.com/deal/123' });
      render(<DealCard deal={deal} />);

      const link = screen.getByRole('link', { name: /view deal/i });
      expect(link).toHaveAttribute('href', 'https://example.com/deal/123');
    });

    it('should open link in new tab', () => {
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const link = screen.getByRole('link', { name: /view deal/i });
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should have security attributes for external link', () => {
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const link = screen.getByRole('link', { name: /view deal/i });
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Save Button', () => {
    it('should render unsaved state by default', () => {
      (SavedDealsService.isSaved as any).mockReturnValue(false);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /save deal/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('🤍');
    });

    it('should render saved state when deal is saved', () => {
      (SavedDealsService.isSaved as any).mockReturnValue(true);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /unsave deal/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('❤️');
    });

    it('should have correct CSS class when unsaved', () => {
      (SavedDealsService.isSaved as any).mockReturnValue(false);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /save deal/i });
      expect(button).toHaveClass('deal-card-save-button');
      expect(button).not.toHaveClass('saved');
    });

    it('should have correct CSS class when saved', () => {
      (SavedDealsService.isSaved as any).mockReturnValue(true);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /unsave deal/i });
      expect(button).toHaveClass('deal-card-save-button');
      expect(button).toHaveClass('saved');
    });

    it('should have correct title attribute when unsaved', () => {
      (SavedDealsService.isSaved as any).mockReturnValue(false);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /save deal/i });
      expect(button).toHaveAttribute('title', 'Save deal');
    });

    it('should have correct title attribute when saved', () => {
      (SavedDealsService.isSaved as any).mockReturnValue(true);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /unsave deal/i });
      expect(button).toHaveAttribute('title', 'Unsave deal');
    });
  });

  describe('Save/Unsave Functionality', () => {
    it('should call save when clicking unsaved button', async () => {
      const user = userEvent.setup();
      (SavedDealsService.isSaved as any).mockReturnValue(false);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /save deal/i });
      await user.click(button);

      expect(SavedDealsService.save).toHaveBeenCalledWith(deal);
      expect(SavedDealsService.save).toHaveBeenCalledTimes(1);
    });

    it('should call unsave when clicking saved button', async () => {
      const user = userEvent.setup();
      (SavedDealsService.isSaved as any).mockReturnValue(true);
      const deal = createMockDeal({ id: 'deal-123' });
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /unsave deal/i });
      await user.click(button);

      expect(SavedDealsService.unsave).toHaveBeenCalledWith('deal-123');
      expect(SavedDealsService.unsave).toHaveBeenCalledTimes(1);
    });

    it('should update button state after saving', async () => {
      const user = userEvent.setup();
      (SavedDealsService.isSaved as any).mockReturnValue(false);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /save deal/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('❤️');
        expect(button).toHaveClass('saved');
      });
    });

    it('should update button state after unsaving', async () => {
      const user = userEvent.setup();
      (SavedDealsService.isSaved as any).mockReturnValue(true);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /unsave deal/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('🤍');
        expect(button).not.toHaveClass('saved');
      });
    });

    it('should handle save errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      (SavedDealsService.isSaved as any).mockReturnValue(false);
      (SavedDealsService.save as any).mockImplementation(() => {
        throw new Error('Save failed');
      });
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /save deal/i });
      await user.click(button);

      expect(consoleError).toHaveBeenCalledWith('Error toggling save:', expect.any(Error));
      consoleError.mockRestore();
    });

    it('should handle unsave errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      (SavedDealsService.isSaved as any).mockReturnValue(true);
      (SavedDealsService.unsave as any).mockImplementation(() => {
        throw new Error('Unsave failed');
      });
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /unsave deal/i });
      await user.click(button);

      expect(consoleError).toHaveBeenCalledWith('Error toggling save:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible save button with aria-label', () => {
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /save deal/i });
      expect(button).toHaveAttribute('aria-label', 'Save deal');
    });

    it('should have accessible unsave button with aria-label', () => {
      (SavedDealsService.isSaved as any).mockReturnValue(true);
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const button = screen.getByRole('button', { name: /unsave deal/i });
      expect(button).toHaveAttribute('aria-label', 'Unsave deal');
    });

    it('should have accessible link with descriptive text', () => {
      const deal = createMockDeal();
      render(<DealCard deal={deal} />);

      const link = screen.getByRole('link', { name: /view deal/i });
      expect(link).toBeInTheDocument();
    });

    it('should have image with alt text', () => {
      const deal = createMockDeal({ title: 'Beach Vacation', imageUrl: 'image.jpg' });
      render(<DealCard deal={deal} />);

      const image = screen.getByAltText('Beach Vacation');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle deal with no inclusions', () => {
      const deal = createMockDeal({ inclusions: [] });
      render(<DealCard deal={deal} />);

      expect(screen.queryByText(/✓/)).not.toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      const deal = createMockDeal({ title: longTitle });
      render(<DealCard deal={deal} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very high price', () => {
      const deal = createMockDeal({ price: 99999 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('$99999')).toBeInTheDocument();
    });

    it('should handle zero price', () => {
      const deal = createMockDeal({ price: 0 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('should handle quality score of 0', () => {
      const deal = createMockDeal({ qualityScore: 0 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText(/0% Quality/)).toBeInTheDocument();
    });

    it('should handle quality score of 100', () => {
      const deal = createMockDeal({ qualityScore: 100 });
      render(<DealCard deal={deal} />);

      expect(screen.getByText(/100% Quality/)).toBeInTheDocument();
    });
  });
});
