import { useState } from 'react';
import { DealsGrid } from '../components/DealsGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SortDropdown } from '../components/SortDropdown';
import { SaveSearchModal } from '../components/SaveSearchModal';
import { SavedSearchesList } from '../components/SavedSearchesList';
import { FilterState, DEFAULT_FILTERS } from '../types/filters';

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleLoadSearch = (loadedFilters: FilterState) => {
    setFilters(loadedFilters);
    setShowFilters(true); // Show filters when loading a saved search
  };

  const handleSaveComplete = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh of saved searches list
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

      <div className="saved-searches-section">
        <SavedSearchesList
          key={refreshKey}
          onLoadSearch={handleLoadSearch}
          currentFilters={filters}
        />
      </div>

      <div className="deals-section">
        <div className="deals-controls">
          <div className="deals-controls-left">
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '✕ Hide Filters' : '⚙ Show Filters'}
            </button>
            <button
              className="save-search-btn"
              onClick={() => setShowSaveModal(true)}
            >
              💾 Save Search
            </button>
          </div>
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

      <SaveSearchModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        currentFilters={filters}
        onSaved={handleSaveComplete}
      />
    </div>
  );
}
