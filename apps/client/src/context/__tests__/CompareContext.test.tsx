import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CompareProvider, useCompareSelection } from '../CompareContext';
import type { TravelDeal } from '../../types/deals';

// Test component to access context
function TestComponent() {
  const { selectedDeals, toggleCompare, clearComparison, isMaxSelected } = useCompareSelection();
  return (
    <div>
      <div data-testid="count">{selectedDeals.length}</div>
      <div data-testid="is-max">{isMaxSelected ? 'yes' : 'no'}</div>
      <button 
        data-testid="add-btn" 
        onClick={() => toggleCompare({ id: '1', title: 'Deal 1', price: 100 } as TravelDeal)}
      >Add</button>
      <button 
        data-testid="add-btn-2" 
        onClick={() => toggleCompare({ id: '2', title: 'Deal 2', price: 200 } as TravelDeal)}
      >Add 2</button>
      <button 
        data-testid="add-btn-3" 
        onClick={() => toggleCompare({ id: '3', title: 'Deal 3', price: 300 } as TravelDeal)}
      >Add 3</button>
      <button 
        data-testid="add-btn-4" 
        onClick={() => toggleCompare({ id: '4', title: 'Deal 4', price: 400 } as TravelDeal)}
      >Add 4</button>
      <button data-testid="clear-btn" onClick={clearComparison}>Clear</button>
    </div>
  );
}

describe('CompareContext', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('adds deals and enforces max limit', () => {
    render(
      <CompareProvider>
        <TestComponent />
      </CompareProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('is-max').textContent).toBe('no');

    act(() => { screen.getByTestId('add-btn').click(); });
    expect(screen.getByTestId('count').textContent).toBe('1');

    act(() => { screen.getByTestId('add-btn-2').click(); });
    act(() => { screen.getByTestId('add-btn-3').click(); });
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('is-max').textContent).toBe('yes');

    // 4th deal should be blocked
    act(() => { screen.getByTestId('add-btn-4').click(); });
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(window.alert).toHaveBeenCalled();
  });

  it('removes deal when toggled again', () => {
    render(
      <CompareProvider>
        <TestComponent />
      </CompareProvider>
    );

    act(() => { screen.getByTestId('add-btn').click(); });
    expect(screen.getByTestId('count').textContent).toBe('1');

    act(() => { screen.getByTestId('add-btn').click(); });
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('clears comparison', () => {
    render(
      <CompareProvider>
        <TestComponent />
      </CompareProvider>
    );

    act(() => { screen.getByTestId('add-btn').click(); });
    act(() => { screen.getByTestId('clear-btn').click(); });
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
