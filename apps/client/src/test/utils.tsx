import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with BrowserRouter
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * Custom render function that wraps components with MemoryRouter
 * Useful for testing with specific routes
 */
export function renderWithMemoryRouter(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    initialIndex = 0,
    ...options
  }: {
    initialEntries?: string[];
    initialIndex?: number;
  } & Omit<RenderOptions, 'wrapper'> = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        {children}
      </MemoryRouter>
    ),
    ...options,
  });
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 3000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Create mock TravelDeal for testing
 */
export function createMockDeal(overrides: any = {}) {
  return {
    id: 'deal-1',
    title: 'Amazing Paris Getaway',
    destination: 'Paris, France',
    price: 1299,
    originalPrice: 1899,
    dealType: 'package',
    provider: 'TravelCo',
    url: 'https://example.com/deal-1',
    imageUrl: 'https://example.com/paris.jpg',
    travelDates: {
      start: '2026-06-01',
      end: '2026-06-08',
    },
    bookingDeadline: '2026-05-15',
    inclusions: ['Flight', 'Hotel', 'Breakfast'],
    qualityScore: 92,
    ...overrides,
  };
}

/**
 * Create mock FilterState for testing
 */
export function createMockFilters(overrides: any = {}) {
  return {
    search: '',
    destination: '',
    minPrice: 0,
    maxPrice: 5000,
    startDate: '',
    endDate: '',
    dealType: '',
    sortBy: 'price-asc',
    ...overrides,
  };
}

/**
 * Simulate user typing in an input
 */
export async function typeInInput(input: HTMLElement, text: string) {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  await user.clear(input);
  await user.type(input, text);
}

/**
 * Simulate user clicking an element
 */
export async function clickElement(element: HTMLElement) {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  await user.click(element);
}

/**
 * Get LocalStorage data for a key
 */
export function getLocalStorageItem(key: string): any {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

/**
 * Set LocalStorage data for a key
 */
export function setLocalStorageItem(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}
