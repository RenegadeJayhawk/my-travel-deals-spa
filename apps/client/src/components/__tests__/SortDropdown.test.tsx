import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortDropdown } from '../SortDropdown';

describe('SortDropdown', () => {
  it('renders dropdown with correct default value', () => {
    render(<SortDropdown value="price-asc" onChange={() => {}} />);
    
    const select = screen.getByRole('combobox', { name: /sort by/i });
    expect(select).toHaveValue('price-asc');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<SortDropdown value="price-asc" onChange={handleChange} />);
    
    const select = screen.getByRole('combobox', { name: /sort by/i });
    fireEvent.change(select, { target: { value: 'quality-desc' } });
    
    expect(handleChange).toHaveBeenCalledWith('quality-desc');
  });

  it('renders all sort options', () => {
    render(<SortDropdown value="price-asc" onChange={() => {}} />);
    
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(screen.getByRole('option', { name: /price: low to high/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /price: high to low/i })).toBeInTheDocument();
  });
});
