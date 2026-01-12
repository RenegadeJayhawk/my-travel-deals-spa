import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DealsGrid } from '../components/DealsGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SortDropdown } from '../components/SortDropdown';
import { SaveSearchModal } from '../components/SaveSearchModal';
import { SavedSearchesList } from '../components/SavedSearchesList';
import { CreateAlertModal } from '../components/CreateAlertModal';
import { PriceAlertsList } from '../components/PriceAlertsList';
import { AlertNotifications } from '../components/AlertNotifications';
import { FilterState, DEFAULT_FILTERS } from '../types/filters';
import { filtersToUrlParams, urlParamsToFilters, hasActiveFilters } from '../utils/urlState';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(() => {
    // Initialize filters from URL on first load
    return urlParamsToFilters(searchParams);
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [alertsRefreshKey, setAlertsRefreshKey] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Sync filters to URL whenever they change (after initial load)
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    const params = filtersToUrlParams(filters);
    setSearchParams(params, { replace: true });
  }, [filters, isInitialLoad, setSearchParams]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleShareUrl = async () => {
    try {
      const params = filtersToUrlParams(filters);
      const url = `${window.location.origin}${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      await navigator.clipboard.writeText(url);
      alert('Search URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL to clipboard');
    }
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

  const handleAlertCreated = () => {
    setAlertsRefreshKey(prev => prev + 1); // Trigger refresh of alerts list
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

      <AlertNotifications />

      <div className="saved-searches-section">
        <SavedSearchesList
          key={refreshKey}
          onLoadSearch={handleLoadSearch}
          currentFilters={filters}
        />
      </div>

      <div className="price-alerts-section">
        <PriceAlertsList key={alertsRefreshKey} />
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
            <button
              className="create-alert-btn"
              onClick={() => setShowAlertModal(true)}
            >
              🔔 Create Alert
            </button>
            {hasActiveFilters(filters) && (
              <button
                className="share-url-btn"
                onClick={handleShareUrl}
                title="Copy shareable URL"
              >
                🔗 Share
              </button>
            )}
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

      <CreateAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onCreated={handleAlertCreated}
        initialDestination={filters.destination}
      />
    </div>
  );
}
