import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveSearchModal } from '../SaveSearchModal';
import { SavedSearchesService } from '../../services/savedSearches';
import type { FilterState } from '../../types/filters';

vi.mock('../../services/savedSearches', () => ({
  SavedSearchesService: {
    nameExists: vi.fn(),
    save: vi.fn(),
  }
}));

const mockFilters: FilterState = {
  search: 'beach',
  destination: 'Hawaii',
  minPrice: 0,
  maxPrice: 5000,
  dealType: '',
  sortBy: 'price-asc',
  startDate: '',
  endDate: '',
};

describe('SaveSearchModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SaveSearchModal isOpen={false} onClose={mockOnClose} onSaved={mockOnSaved} currentFilters={mockFilters} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when open with filter preview', () => {
    render(
      <SaveSearchModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} currentFilters={mockFilters} />
    );
    
    expect(screen.getByText('Save Current Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Search Name')).toBeInTheDocument();
    expect(screen.getByText('beach')).toBeInTheDocument(); // Search preview
    expect(screen.getByText('Hawaii')).toBeInTheDocument(); // Destination preview
  });

  it('validates empty name', async () => {
    render(
      <SaveSearchModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} currentFilters={mockFilters} />
    );
    
    fireEvent.click(screen.getByText('Save Search'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a name for this search')).toBeInTheDocument();
    });
  });

  it('validates short name', async () => {
    render(
      <SaveSearchModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} currentFilters={mockFilters} />
    );
    
    fireEvent.change(screen.getByLabelText('Search Name'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByText('Save Search'));
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('shows error if name already exists', async () => {
    vi.mocked(SavedSearchesService.nameExists).mockReturnValue(true);
    
    render(
      <SaveSearchModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} currentFilters={mockFilters} />
    );
    
    fireEvent.change(screen.getByLabelText('Search Name'), { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save Search'));
    
    await waitFor(() => {
      expect(screen.getByText('A search with this name already exists')).toBeInTheDocument();
    });
  });

  it('saves search successfully and calls callbacks', async () => {
    vi.mocked(SavedSearchesService.nameExists).mockReturnValue(false);
    
    render(
      <SaveSearchModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} currentFilters={mockFilters} />
    );
    
    fireEvent.change(screen.getByLabelText('Search Name'), { target: { value: 'My Summer Search' } });
    fireEvent.click(screen.getByText('Save Search'));
    
    await waitFor(() => {
      expect(SavedSearchesService.save).toHaveBeenCalledWith('My Summer Search', mockFilters);
      expect(mockOnSaved).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles enter key to save', async () => {
    vi.mocked(SavedSearchesService.nameExists).mockReturnValue(false);
    
    render(
      <SaveSearchModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} currentFilters={mockFilters} />
    );
    
    const input = screen.getByLabelText('Search Name');
    fireEvent.change(input, { target: { value: 'Keyboard Save' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(SavedSearchesService.save).toHaveBeenCalledWith('Keyboard Save', mockFilters);
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });
});
