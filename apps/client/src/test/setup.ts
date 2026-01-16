import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock Clipboard API
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock fetch for API calls
global.fetch = vi.fn();

// Helper to mock successful fetch responses
export function mockFetchSuccess(data: any) {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
    status: 200,
  });
}

// Helper to mock failed fetch responses
export function mockFetchError(status: number = 500, message: string = 'Server Error') {
  (global.fetch as any).mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ error: message }),
  });
}

// Helper to reset all mocks
export function resetAllMocks() {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
}
