import { describe, it, expect } from 'vitest';
import { filtersToUrlParams, urlParamsToFilters, hasActiveFilters } from '../../utils/urlState';
import { DEFAULT_FILTERS } from '../../types/filters';

describe('Filter Changes Integration Tests', () => {
  describe('URL Serialization', () => {
    it('should serialize search filter to URL', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        search: 'paris',
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('q')).toBe('paris');
      expect(params.has('minPrice')).toBe(false); // Default value not included
    });

    it('should serialize price range filters to URL', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        minPrice: 500,
        maxPrice: 2000,
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('minPrice')).toBe('500');
      expect(params.get('maxPrice')).toBe('2000');
    });

    it('should serialize destination filter to URL', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        destination: 'Hawaii',
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('dest')).toBe('Hawaii');
    });

    it('should serialize date filters to URL', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        startDate: '2026-06-01',
        endDate: '2026-06-15',
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('startDate')).toBe('2026-06-01');
      expect(params.get('endDate')).toBe('2026-06-15');
    });

    it('should serialize deal type filter to URL', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        dealType: 'package',
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('type')).toBe('package');
    });

    it('should serialize sort option to URL', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        sortBy: 'price-desc',
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('sort')).toBe('price-desc');
    });

    it('should serialize multiple filters to URL', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        search: 'beach',
        destination: 'Hawaii',
        minPrice: 1000,
        maxPrice: 3000,
        dealType: 'all-inclusive',
        sortBy: 'quality-desc',
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('q')).toBe('beach');
      expect(params.get('dest')).toBe('Hawaii');
      expect(params.get('minPrice')).toBe('1000');
      expect(params.get('maxPrice')).toBe('3000');
      expect(params.get('type')).toBe('all-inclusive');
      expect(params.get('sort')).toBe('quality-desc');
    });

    it('should only include non-default values', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        search: 'paris',
        minPrice: 0, // Default
        maxPrice: 5000, // Default
        sortBy: 'price-asc', // Default
      };

      const params = filtersToUrlParams(filters);

      expect(params.get('q')).toBe('paris');
      expect(params.has('minPrice')).toBe(false);
      expect(params.has('maxPrice')).toBe(false);
      expect(params.has('sort')).toBe(false);
    });
  });

  describe('URL Parsing', () => {
    it('should parse search parameter from URL', () => {
      const params = new URLSearchParams('?q=paris');
      const filters = urlParamsToFilters(params);

      expect(filters.search).toBe('paris');
    });

    it('should parse price range parameters from URL', () => {
      const params = new URLSearchParams('?minPrice=500&maxPrice=2000');
      const filters = urlParamsToFilters(params);

      expect(filters.minPrice).toBe(500);
      expect(filters.maxPrice).toBe(2000);
    });

    it('should parse destination parameter from URL', () => {
      const params = new URLSearchParams('?dest=Hawaii');
      const filters = urlParamsToFilters(params);

      expect(filters.destination).toBe('Hawaii');
    });

    it('should parse date parameters from URL', () => {
      const params = new URLSearchParams('?startDate=2026-06-01&endDate=2026-06-15');
      const filters = urlParamsToFilters(params);

      expect(filters.startDate).toBe('2026-06-01');
      expect(filters.endDate).toBe('2026-06-15');
    });

    it('should parse deal type parameter from URL', () => {
      const params = new URLSearchParams('?type=package');
      const filters = urlParamsToFilters(params);

      expect(filters.dealType).toBe('package');
    });

    it('should parse sort parameter from URL', () => {
      const params = new URLSearchParams('?sort=price-desc');
      const filters = urlParamsToFilters(params);

      expect(filters.sortBy).toBe('price-desc');
    });

    it('should parse multiple parameters from URL', () => {
      const params = new URLSearchParams('?q=beach&dest=Hawaii&minPrice=1000&maxPrice=3000&type=all-inclusive&sort=quality-desc');
      const filters = urlParamsToFilters(params);

      expect(filters.search).toBe('beach');
      expect(filters.destination).toBe('Hawaii');
      expect(filters.minPrice).toBe(1000);
      expect(filters.maxPrice).toBe(3000);
      expect(filters.dealType).toBe('all-inclusive');
      expect(filters.sortBy).toBe('quality-desc');
    });

    it('should use defaults for missing parameters', () => {
      const params = new URLSearchParams('?q=paris');
      const filters = urlParamsToFilters(params);

      expect(filters.search).toBe('paris');
      expect(filters.minPrice).toBe(DEFAULT_FILTERS.minPrice);
      expect(filters.maxPrice).toBe(DEFAULT_FILTERS.maxPrice);
      expect(filters.sortBy).toBe(DEFAULT_FILTERS.sortBy);
    });

    it('should handle invalid price parameters', () => {
      const params = new URLSearchParams('?minPrice=invalid&maxPrice=-100');
      const filters = urlParamsToFilters(params);

      expect(filters.minPrice).toBe(DEFAULT_FILTERS.minPrice);
      expect(filters.maxPrice).toBe(DEFAULT_FILTERS.maxPrice);
    });

    it('should handle invalid date parameters', () => {
      const params = new URLSearchParams('?startDate=invalid-date&endDate=not-a-date');
      const filters = urlParamsToFilters(params);

      expect(filters.startDate).toBe('');
      expect(filters.endDate).toBe('');
    });

    it('should handle special characters in search', () => {
      const params = new URLSearchParams();
      params.set('q', 'São Paulo');
      const filters = urlParamsToFilters(params);

      expect(filters.search).toBe('São Paulo');
    });

    it('should handle empty parameters', () => {
      const params = new URLSearchParams('?q=&dest=');
      const filters = urlParamsToFilters(params);

      expect(filters.search).toBe('');
      expect(filters.destination).toBe('');
    });
  });

  describe('Round-trip Serialization', () => {
    it('should maintain filter values through serialization and parsing', () => {
      const originalFilters = {
        ...DEFAULT_FILTERS,
        search: 'paris',
        destination: 'France',
        minPrice: 500,
        maxPrice: 2000,
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        dealType: 'package',
        sortBy: 'price-desc',
      };

      const params = filtersToUrlParams(originalFilters);
      const parsedFilters = urlParamsToFilters(params);

      expect(parsedFilters.search).toBe(originalFilters.search);
      expect(parsedFilters.destination).toBe(originalFilters.destination);
      expect(parsedFilters.minPrice).toBe(originalFilters.minPrice);
      expect(parsedFilters.maxPrice).toBe(originalFilters.maxPrice);
      expect(parsedFilters.startDate).toBe(originalFilters.startDate);
      expect(parsedFilters.endDate).toBe(originalFilters.endDate);
      expect(parsedFilters.dealType).toBe(originalFilters.dealType);
      expect(parsedFilters.sortBy).toBe(originalFilters.sortBy);
    });

    it('should handle special characters through round-trip', () => {
      const originalFilters = {
        ...DEFAULT_FILTERS,
        search: 'São Paulo & München',
        destination: 'Côte d\'Azur',
      };

      const params = filtersToUrlParams(originalFilters);
      const parsedFilters = urlParamsToFilters(params);

      expect(parsedFilters.search).toBe(originalFilters.search);
      expect(parsedFilters.destination).toBe(originalFilters.destination);
    });
  });

  describe('Active Filters Detection', () => {
    it('should detect active search filter', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        search: 'paris',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should detect active price filters', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        minPrice: 500,
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should detect active destination filter', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        destination: 'Hawaii',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should detect active date filters', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        startDate: '2026-06-01',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should detect active deal type filter', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        dealType: 'package',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should detect active sort filter', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        sortBy: 'price-desc',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return false for default filters', () => {
      expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    });

    it('should detect multiple active filters', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        search: 'beach',
        minPrice: 1000,
        dealType: 'all-inclusive',
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });
  });
});
