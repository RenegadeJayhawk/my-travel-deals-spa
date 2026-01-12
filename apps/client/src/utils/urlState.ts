import { FilterState, DEFAULT_FILTERS } from '../types/filters';

/**
 * Utility functions for syncing filter state with URL query parameters
 */

/**
 * Serialize filter state to URL query parameters
 * Only includes non-default values to keep URLs clean
 */
export function filtersToUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Only add parameters that differ from defaults
  if (filters.search && filters.search !== DEFAULT_FILTERS.search) {
    params.set('q', filters.search);
  }

  if (filters.destination && filters.destination !== DEFAULT_FILTERS.destination) {
    params.set('dest', filters.destination);
  }

  if (filters.minPrice !== DEFAULT_FILTERS.minPrice) {
    params.set('minPrice', filters.minPrice.toString());
  }

  if (filters.maxPrice !== DEFAULT_FILTERS.maxPrice) {
    params.set('maxPrice', filters.maxPrice.toString());
  }

  if (filters.startDate && filters.startDate !== DEFAULT_FILTERS.startDate) {
    params.set('startDate', filters.startDate);
  }

  if (filters.endDate && filters.endDate !== DEFAULT_FILTERS.endDate) {
    params.set('endDate', filters.endDate);
  }

  if (filters.dealType && filters.dealType !== DEFAULT_FILTERS.dealType) {
    params.set('type', filters.dealType);
  }

  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.set('sort', filters.sortBy);
  }

  return params;
}

/**
 * Parse URL query parameters to filter state
 * Falls back to defaults for missing or invalid values
 */
export function urlParamsToFilters(params: URLSearchParams): FilterState {
  const filters: FilterState = { ...DEFAULT_FILTERS };

  // Parse search query
  const search = params.get('q');
  if (search) {
    filters.search = search;
  }

  // Parse destination
  const destination = params.get('dest');
  if (destination) {
    filters.destination = destination;
  }

  // Parse min price
  const minPrice = params.get('minPrice');
  if (minPrice) {
    const parsed = parseInt(minPrice, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      filters.minPrice = parsed;
    }
  }

  // Parse max price
  const maxPrice = params.get('maxPrice');
  if (maxPrice) {
    const parsed = parseInt(maxPrice, 10);
    if (!isNaN(parsed) && parsed > 0) {
      filters.maxPrice = parsed;
    }
  }

  // Parse start date
  const startDate = params.get('startDate');
  if (startDate && isValidDate(startDate)) {
    filters.startDate = startDate;
  }

  // Parse end date
  const endDate = params.get('endDate');
  if (endDate && isValidDate(endDate)) {
    filters.endDate = endDate;
  }

  // Parse deal type
  const dealType = params.get('type');
  if (dealType) {
    filters.dealType = dealType;
  }

  // Parse sort option
  const sortBy = params.get('sort');
  if (sortBy) {
    filters.sortBy = sortBy;
  }

  return filters;
}

/**
 * Check if a date string is valid (YYYY-MM-DD format)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if filters differ from defaults
 * Used to determine if URL should be updated
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search !== DEFAULT_FILTERS.search ||
    filters.destination !== DEFAULT_FILTERS.destination ||
    filters.minPrice !== DEFAULT_FILTERS.minPrice ||
    filters.maxPrice !== DEFAULT_FILTERS.maxPrice ||
    filters.startDate !== DEFAULT_FILTERS.startDate ||
    filters.endDate !== DEFAULT_FILTERS.endDate ||
    filters.dealType !== DEFAULT_FILTERS.dealType ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy
  );
}

/**
 * Generate a shareable URL for the current filter state
 */
export function generateShareableUrl(filters: FilterState, baseUrl?: string): string {
  const params = filtersToUrlParams(filters);
  const base = baseUrl || window.location.origin;
  const queryString = params.toString();

  return queryString ? `${base}/?${queryString}` : base;
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableUrl(filters: FilterState): Promise<boolean> {
  try {
    const url = generateShareableUrl(filters);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    return false;
  }
}
