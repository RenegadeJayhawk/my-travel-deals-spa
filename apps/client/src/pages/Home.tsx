import { useState } from 'react';
import { DealsGrid } from '../components/DealsGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SortDropdown } from '../components/SortDropdown';
import { FilterState, DEFAULT_FILTERS } from '../types/filters';

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1>Discover Amazing Travel Deals</h1>
        <p className="hero-subtitle">
          Find the best travel packages, flights, and accommodations at unbeatable prices
        </p>
      </div>

      <div className="search-section">
        <SearchBar
          value={filters.search}
          onChange={(value) => handleFilterChange({ search: value })}
        />
      </div>

      <div className="deals-section">
        <div className="deals-controls">
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '✕ Hide Filters' : '⚙ Show Filters'}
          </button>
          <SortDropdown
            value={filters.sortBy}
            onChange={(value) => handleFilterChange({ sortBy: value })}
          />
        </div>

        <div className="deals-content">
          {showFilters && (
            <aside className="filters-sidebar">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </aside>
          )}
          <main className="deals-main">
            <DealsGrid filters={filters} />
          </main>
        </div>
      </div>
    </div>
  );
}
