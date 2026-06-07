import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SavedSearchesList } from '../SavedSearchesList';
import { SavedSearchesService } from '../../services/savedSearches';
import { createMockFilters } from '../../test/utils';
import type { SavedSearch } from '../../types/filters';

// Mock SavedSearchesService
vi.mock('../../services/savedSearches', () => ({
  SavedSearchesService: {
    getAll: vi.fn(),
    markAsUsed: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('SavedSearchesList Component', () => {
  const mockOnLoadSearch = vi.fn();
  const currentFilters = createMockFilters();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockSavedSearch = (overrides?: Partial<SavedSearch>): SavedSearch => ({
    id: 'search-1',
    name: 'Paris Vacation',
    filters: createMockFilters({ destination: 'Paris' }),
    createdAt: new Date().toISOString(),
    lastUsed: undefined,
    ...overrides,
  });

  describe('Empty State', () => {
    it('should render empty state when no saved searches', () => {
      (SavedSearchesService.getAll as any).mockReturnValue([]);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      expect(screen.getByText(/no saved searches yet/i)).toBeInTheDocument();
    });

    it('should show helpful message in empty state', () => {
      (SavedSearchesService.getAll as any).mockReturnValue([]);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      expect(
        screen.getByText(/save your current filters to quickly access them later/i)
      ).toBeInTheDocument();
    });

    it('should not render header when empty', () => {
      (SavedSearchesService.getAll as any).mockReturnValue([]);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      // Should show empty state message instead of header
      expect(screen.queryByRole('heading', { name: /saved searches/i })).not.toBeInTheDocument();
      expect(screen.getByText(/no saved searches yet/i)).toBeInTheDocument();
    });
  });

  describe('Rendering with Saved Searches', () => {
    it('should render header with count', () => {
      const searches = [createMockSavedSearch(), createMockSavedSearch({ id: 'search-2' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      expect(screen.getByText(/saved searches \(2\)/i)).toBeInTheDocument();
    });

    it('should render toggle button', () => {
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });

    it('should start collapsed by default', () => {
      const searches = [createMockSavedSearch({ name: 'Test Search' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      expect(screen.queryByText('Test Search')).not.toBeInTheDocument();
    });

    it('should show searches when expanded', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch({ name: 'Test Search' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand/i });
      await user.click(toggleButton);

      expect(screen.getByText('Test Search')).toBeInTheDocument();
    });

    it('should render all saved searches', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [
        createMockSavedSearch({ id: 'search-1', name: 'Paris Trip' }),
        createMockSavedSearch({ id: 'search-2', name: 'Tokyo Adventure' }),
        createMockSavedSearch({ id: 'search-3', name: 'London Getaway' }),
      ];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText('Paris Trip')).toBeInTheDocument();
      expect(screen.getByText('Tokyo Adventure')).toBeInTheDocument();
      expect(screen.getByText('London Getaway')).toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('should expand when toggle button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch({ name: 'Test Search' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand/i });
      await user.click(toggleButton);

      expect(screen.getByText('Test Search')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
    });

    it('should collapse when toggle button is clicked again', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch({ name: 'Test Search' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      const expandButton = screen.getByRole('button', { name: /expand/i });
      await user.click(expandButton);
      
      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      await user.click(collapseButton);

      expect(screen.queryByText('Test Search')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });

    it('should show + icon when collapsed', () => {
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand/i });
      expect(toggleButton).toHaveTextContent('+');
    });

    it('should show − icon when expanded', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand/i });
      await user.click(toggleButton);

      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      expect(collapseButton).toHaveTextContent('−');
    });
  });

  describe('Search Display', () => {
    it('should display search name', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch({ name: 'My Custom Search' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText('My Custom Search')).toBeInTheDocument();
    });

    it('should display filter summary', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createMockFilters({ destination: 'Paris', dealType: 'package' });
      const searches = [createMockSavedSearch({ filters })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/paris.*package/i)).toBeInTheDocument();
    });

    it('should display creation date', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });

    it('should display last used date when available', async () => {
      const user = userEvent.setup({ delay: null });
      const lastUsed = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      const searches = [createMockSavedSearch({ lastUsed })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/last used/i)).toBeInTheDocument();
    });

    it('should not display last used when not available', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch({ lastUsed: undefined })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.queryByText(/last used/i)).not.toBeInTheDocument();
    });
  });

  describe('Filter Summary', () => {
    it('should include destination in summary', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createMockFilters({ destination: 'Tokyo' });
      const searches = [createMockSavedSearch({ filters })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/tokyo/i)).toBeInTheDocument();
    });

    it('should include deal type in summary', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createMockFilters({ dealType: 'all-inclusive' });
      const searches = [createMockSavedSearch({ filters })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/all-inclusive/i)).toBeInTheDocument();
    });

    it('should include price range in summary when non-default', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createMockFilters({ minPrice: 500, maxPrice: 2000 });
      const searches = [createMockSavedSearch({ filters })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/\$500-\$2000/)).toBeInTheDocument();
    });

    it('should include start date in summary', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createMockFilters({ startDate: '2026-06-01' });
      const searches = [createMockSavedSearch({ filters })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/from 2026-06-01/)).toBeInTheDocument();
    });

    it('should show default message when all filters are default', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createMockFilters();
      const searches = [createMockSavedSearch({ filters })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/all filters default/i)).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should show "Just now" for very recent dates', async () => {
      const user = userEvent.setup({ delay: null });
      const createdAt = new Date().toISOString();
      const searches = [createMockSavedSearch({ createdAt })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    it('should show minutes ago for recent dates', async () => {
      const user = userEvent.setup({ delay: null });
      const createdAt = new Date(Date.now() - 5 * 60000).toISOString(); // 5 minutes ago
      const searches = [createMockSavedSearch({ createdAt })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/5m ago/)).toBeInTheDocument();
    });

    it('should show hours ago for dates within 24 hours', async () => {
      const user = userEvent.setup({ delay: null });
      const createdAt = new Date(Date.now() - 3 * 3600000).toISOString(); // 3 hours ago
      const searches = [createMockSavedSearch({ createdAt })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/3h ago/)).toBeInTheDocument();
    });

    it('should show days ago for dates within a week', async () => {
      const user = userEvent.setup({ delay: null });
      const createdAt = new Date(Date.now() - 3 * 86400000).toISOString(); // 3 days ago
      const searches = [createMockSavedSearch({ createdAt })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(/3d ago/)).toBeInTheDocument();
    });

    it('should show full date for dates older than a week', async () => {
      const user = userEvent.setup({ delay: null });
      const createdAt = new Date(Date.now() - 10 * 86400000).toISOString(); // 10 days ago
      const searches = [createMockSavedSearch({ createdAt })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      // Should show formatted date like "1/1/2026"
      expect(screen.getByText(/\d+\/\d+\/\d+/)).toBeInTheDocument();
    });
  });

  describe('Load Functionality', () => {
    it('should call onLoadSearch when load button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createMockFilters({ destination: 'Paris' });
      const searches = [createMockSavedSearch({ filters })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const loadButton = screen.getByRole('button', { name: /load/i });
      await user.click(loadButton);

      expect(mockOnLoadSearch).toHaveBeenCalledWith(filters);
    });

    it('should mark search as used when loaded', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch({ id: 'search-123' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const loadButton = screen.getByRole('button', { name: /load/i });
      await user.click(loadButton);

      expect(SavedSearchesService.markAsUsed).toHaveBeenCalledWith('search-123');
    });

    it('should reload searches after loading', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const loadButton = screen.getByRole('button', { name: /load/i });
      await user.click(loadButton);

      expect(SavedSearchesService.getAll).toHaveBeenCalledTimes(2); // Initial + after load
    });
  });

  describe('Delete Functionality', () => {
    it('should show confirmation when delete is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      expect(screen.getByRole('button', { name: /confirm\?/i })).toBeInTheDocument();
    });

    it('should delete search when confirmed', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch({ id: 'search-123' })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);
      
      const confirmButton = screen.getByRole('button', { name: /confirm\?/i });
      await user.click(confirmButton);

      expect(SavedSearchesService.delete).toHaveBeenCalledWith('search-123');
    });

    it('should reload searches after deletion', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);
      
      const confirmButton = screen.getByRole('button', { name: /confirm\?/i });
      await user.click(confirmButton);

      expect(SavedSearchesService.getAll).toHaveBeenCalledTimes(2); // Initial + after delete
    });

    it('should auto-cancel confirmation after 3 seconds', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      expect(screen.getByRole('button', { name: /confirm\?/i })).toBeInTheDocument();

      // Wait for auto-cancel after 3 seconds
      await waitFor(
        () => {
          expect(screen.queryByRole('button', { name: /confirm\?/i })).not.toBeInTheDocument();
        },
        { timeout: 4000 } // Wait up to 4 seconds for the 3-second timeout
      );
    });

    it('should not delete if confirmation times out', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      // Wait for the timeout to occur
      await waitFor(
        () => {
          expect(screen.queryByRole('button', { name: /confirm\?/i })).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      // Verify delete was not called during the timeout
      expect(SavedSearchesService.delete).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible toggle button', () => {
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Expand');
    });

    it('should update aria-label when expanded', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand/i });
      await user.click(toggleButton);

      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      expect(collapseButton).toHaveAttribute('aria-label', 'Collapse');
    });

    it('should have accessible load buttons', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      const loadButton = screen.getByRole('button', { name: /load/i });
      expect(loadButton).toHaveAttribute('title', 'Load this search');
    });

    it('should have accessible delete buttons', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      expect(deleteButton).toHaveAttribute('title', 'Delete this search');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single saved search', () => {
      const searches = [createMockSavedSearch()];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      expect(screen.getByText(/saved searches \(1\)/i)).toBeInTheDocument();
    });

    it('should handle many saved searches', async () => {
      const user = userEvent.setup({ delay: null });
      const searches = Array.from({ length: 20 }, (_, i) =>
        createMockSavedSearch({ id: `search-${i}`, name: `Search ${i}` })
      );
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      expect(screen.getByText(/saved searches \(20\)/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText('Search 0')).toBeInTheDocument();
      expect(screen.getByText('Search 19')).toBeInTheDocument();
    });

    it('should handle very long search names', async () => {
      const user = userEvent.setup({ delay: null });
      const longName = 'A'.repeat(200);
      const searches = [createMockSavedSearch({ name: longName })];
      (SavedSearchesService.getAll as any).mockReturnValue(searches);
      
      render(
        <SavedSearchesList
          onLoadSearch={mockOnLoadSearch}
          currentFilters={currentFilters}
        />
      );

      await user.click(screen.getByRole('button', { name: /expand/i }));

      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });
});
