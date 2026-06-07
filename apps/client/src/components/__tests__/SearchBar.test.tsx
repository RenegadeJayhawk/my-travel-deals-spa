import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders input with default placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search destinations, cities, or countries...')).toBeInTheDocument();
  });

  it('renders input with custom placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Custom search..." />);
    expect(screen.getByPlaceholderText('Custom search...')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(input, { target: { value: 'Paris' } });
    
    expect(handleChange).toHaveBeenCalledWith('Paris');
  });

  it('shows clear button when value is not empty', () => {
    render(<SearchBar value="Tokyo" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('calls onChange with empty string when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="London" onChange={handleChange} />);
    
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearBtn);
    
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
