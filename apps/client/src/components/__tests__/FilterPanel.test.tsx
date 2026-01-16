import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../FilterPanel';
import { DEFAULT_FILTERS, DEAL_TYPES } from '../../types/filters';
import { createMockFilters } from '../../test/utils';

describe('FilterPanel Component', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter panel heading', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByRole('button', { name: /reset all/i })).toBeInTheDocument();
    });

    it('should render destination input', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    });

    it('should render deal type select', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByLabelText(/deal type/i)).toBeInTheDocument();
    });

    it('should render price range inputs', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/price range/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/min/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/max/i)).toBeInTheDocument();
    });

    it('should render travel date inputs', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByLabelText(/travel start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/travel end date/i)).toBeInTheDocument();
    });
  });

  describe('Filter Values Display', () => {
    it('should display destination value', () => {
      const filters = createMockFilters({ destination: 'Paris' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/destination/i) as HTMLInputElement;
      expect(input.value).toBe('Paris');
    });

    it('should display deal type value', () => {
      const filters = createMockFilters({ dealType: 'package' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const select = screen.getByLabelText(/deal type/i) as HTMLSelectElement;
      expect(select.value).toBe('package');
    });

    it('should display min price value', () => {
      const filters = createMockFilters({ minPrice: 500 });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/min/i) as HTMLInputElement;
      expect(input.value).toBe('500');
    });

    it('should display max price value', () => {
      const filters = createMockFilters({ maxPrice: 2000 });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/max/i) as HTMLInputElement;
      expect(input.value).toBe('2000');
    });

    it('should display start date value', () => {
      const filters = createMockFilters({ startDate: '2026-06-01' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/travel start date/i) as HTMLInputElement;
      expect(input.value).toBe('2026-06-01');
    });

    it('should display end date value', () => {
      const filters = createMockFilters({ endDate: '2026-06-15' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/travel end date/i) as HTMLInputElement;
      expect(input.value).toBe('2026-06-15');
    });
  });

  describe('Deal Type Options', () => {
    it('should render all deal type options', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const select = screen.getByLabelText(/deal type/i);
      const options = Array.from(select.querySelectorAll('option'));

      expect(options).toHaveLength(DEAL_TYPES.length);
    });

    it('should render deal type options with correct values', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      DEAL_TYPES.forEach((dealType) => {
        expect(screen.getByRole('option', { name: dealType.label })).toBeInTheDocument();
      });
    });

    it('should have "All Types" as first option', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const select = screen.getByLabelText(/deal type/i);
      const firstOption = select.querySelector('option');
      expect(firstOption?.textContent).toBe('All Types');
    });
  });

  describe('User Interactions - Destination', () => {
    it('should call onFilterChange when destination changes', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/destination/i);
      fireEvent.change(input, { target: { value: 'Paris' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({ destination: 'Paris' });
    });

    it('should call onFilterChange with empty string when destination is cleared', async () => {
      const user = userEvent.setup();
      const filters = createMockFilters({ destination: 'Paris' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/destination/i);
      await user.clear(input);

      expect(mockOnFilterChange).toHaveBeenCalledWith({ destination: '' });
    });
  });

  describe('User Interactions - Deal Type', () => {
    it('should call onFilterChange when deal type changes', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const select = screen.getByLabelText(/deal type/i);
      await user.selectOptions(select, 'package');

      expect(mockOnFilterChange).toHaveBeenCalledWith({ dealType: 'package' });
    });

    it('should call onFilterChange for each deal type option', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const select = screen.getByLabelText(/deal type/i);

      for (const dealType of DEAL_TYPES.slice(1, 4)) {
        await user.selectOptions(select, dealType.value);
        expect(mockOnFilterChange).toHaveBeenCalledWith({ dealType: dealType.value });
      }
    });
  });

  describe('User Interactions - Price Range', () => {
    it('should call onFilterChange when min price changes', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/min/i);
      fireEvent.change(input, { target: { value: '500' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({ minPrice: 500 });
    });

    it('should call onFilterChange when max price changes', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/max/i);
      fireEvent.change(input, { target: { value: '2000' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({ maxPrice: 2000 });
    });

    it('should handle clearing min price', async () => {
      const user = userEvent.setup();
      const filters = createMockFilters({ minPrice: 500 });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/min/i);
      await user.clear(input);

      expect(mockOnFilterChange).toHaveBeenCalledWith({ minPrice: 0 });
    });

    it('should handle clearing max price', async () => {
      const user = userEvent.setup();
      const filters = createMockFilters({ maxPrice: 2000 });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/max/i);
      await user.clear(input);

      expect(mockOnFilterChange).toHaveBeenCalledWith({ maxPrice: 0 });
    });
  });

  describe('User Interactions - Travel Dates', () => {
    it('should call onFilterChange when start date changes', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/travel start date/i);
      await user.type(input, '2026-06-01');

      expect(mockOnFilterChange).toHaveBeenCalledWith({ startDate: '2026-06-01' });
    });

    it('should call onFilterChange when end date changes', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/travel end date/i);
      await user.type(input, '2026-06-15');

      expect(mockOnFilterChange).toHaveBeenCalledWith({ endDate: '2026-06-15' });
    });

    it('should handle clearing start date', async () => {
      const user = userEvent.setup();
      const filters = createMockFilters({ startDate: '2026-06-01' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/travel start date/i);
      await user.clear(input);

      expect(mockOnFilterChange).toHaveBeenCalledWith({ startDate: '' });
    });

    it('should handle clearing end date', async () => {
      const user = userEvent.setup();
      const filters = createMockFilters({ endDate: '2026-06-15' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/travel end date/i);
      await user.clear(input);

      expect(mockOnFilterChange).toHaveBeenCalledWith({ endDate: '' });
    });
  });

  describe('Reset Functionality', () => {
    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const button = screen.getByRole('button', { name: /reset all/i });
      await user.click(button);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should not call onFilterChange when reset is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const button = screen.getByRole('button', { name: /reset all/i });
      await user.click(button);

      expect(mockOnFilterChange).not.toHaveBeenCalled();
    });
  });

  describe('Input Constraints', () => {
    it('should have min attribute on min price input', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/min/i);
      expect(input).toHaveAttribute('min', '0');
    });

    it('should have max attribute on min price input based on max price', () => {
      const filters = createMockFilters({ maxPrice: 2000 });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/min/i);
      expect(input).toHaveAttribute('max', '2000');
    });

    it('should have min attribute on max price input based on min price', () => {
      const filters = createMockFilters({ minPrice: 500 });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/max/i);
      expect(input).toHaveAttribute('min', '500');
    });

    it('should have min attribute on end date input based on start date', () => {
      const filters = createMockFilters({ startDate: '2026-06-01' });
      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/travel end date/i);
      expect(input).toHaveAttribute('min', '2026-06-01');
    });
  });

  describe('Accessibility', () => {
    it('should have labels for all inputs', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/deal type/i)).toBeInTheDocument();
      expect(screen.getByText(/price range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/travel start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/travel end date/i)).toBeInTheDocument();
    });

    it('should have proper htmlFor attributes on labels', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const destinationLabel = screen.getByText('Destination');
      expect(destinationLabel).toHaveAttribute('for', 'destination');

      const dealTypeLabel = screen.getByText('Deal Type');
      expect(dealTypeLabel).toHaveAttribute('for', 'dealType');
    });

    it('should have placeholder text for destination input', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/destination/i);
      expect(input).toHaveAttribute('placeholder', 'e.g., Paris, Tokyo');
    });

    it('should have proper input types', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByLabelText(/destination/i)).toHaveAttribute('type', 'text');
      expect(screen.getByPlaceholderText(/min/i)).toHaveAttribute('type', 'number');
      expect(screen.getByPlaceholderText(/max/i)).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText(/travel start date/i)).toHaveAttribute('type', 'date');
      expect(screen.getByLabelText(/travel end date/i)).toHaveAttribute('type', 'date');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long destination input', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const longDestination = 'A'.repeat(200);
      const input = screen.getByLabelText(/destination/i);
      fireEvent.change(input, { target: { value: longDestination } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({ destination: longDestination });
    });

    it('should handle negative price input', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/min/i);
      await user.type(input, '-100');

      // Component should still call onFilterChange with the value
      expect(mockOnFilterChange).toHaveBeenCalled();
    });

    it('should handle very large price values', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText(/max/i);
      fireEvent.change(input, { target: { value: '999999' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({ maxPrice: 999999 });
    });

    it('should handle special characters in destination', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByLabelText(/destination/i);
      fireEvent.change(input, { target: { value: 'São Paulo' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        destination: 'São Paulo',
      });
    });
  });

  describe('CSS Classes', () => {
    it('should have correct CSS classes on panel', () => {
      const { container } = render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(container.querySelector('.filter-panel')).toBeInTheDocument();
    });

    it('should have correct CSS classes on inputs', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const destinationInput = screen.getByLabelText(/destination/i);
      expect(destinationInput).toHaveClass('filter-input');

      const dealTypeSelect = screen.getByLabelText(/deal type/i);
      expect(dealTypeSelect).toHaveClass('filter-select');

      const minPriceInput = screen.getByPlaceholderText(/min/i);
      expect(minPriceInput).toHaveClass('filter-input', 'price-input');
    });

    it('should have correct CSS class on reset button', () => {
      render(
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const button = screen.getByRole('button', { name: /reset all/i });
      expect(button).toHaveClass('filter-reset');
    });
  });
});
