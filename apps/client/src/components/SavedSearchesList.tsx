import React, { useState, useEffect } from 'react';
import { SavedSearch, FilterState } from '../types/filters';
import { SavedSearchesService } from '../services/savedSearches';

interface SavedSearchesListProps {
  onLoadSearch: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export const SavedSearchesList: React.FC<SavedSearchesListProps> = ({
  onLoadSearch,
  currentFilters,
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = () => {
    const searches = SavedSearchesService.getAll();
    setSavedSearches(searches);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    SavedSearchesService.markAsUsed(search.id);
    onLoadSearch(search.filters);
    loadSavedSearches(); // Refresh to update lastUsed
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      SavedSearchesService.delete(id);
      loadSavedSearches();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getFilterSummary = (filters: FilterState): string => {
    const parts: string[] = [];
    
    if (filters.destination) parts.push(filters.destination);
    if (filters.dealType) parts.push(filters.dealType);
    if (filters.minPrice > 0 || filters.maxPrice < 5000) {
      parts.push(`$${filters.minPrice}-$${filters.maxPrice}`);
    }
    if (filters.startDate) parts.push(`from ${filters.startDate}`);
    
    return parts.length > 0 ? parts.join(' • ') : 'All filters default';
  };

  if (savedSearches.length === 0) {
    return (
      <div className="saved-searches-empty">
        <p>No saved searches yet. Save your current filters to quickly access them later!</p>
      </div>
    );
  }

  return (
    <div className="saved-searches-container">
      <div className="saved-searches-header">
        <h3>
          Saved Searches ({savedSearches.length})
        </h3>
        <button
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="saved-searches-list">
          {savedSearches.map((search) => (
            <div key={search.id} className="saved-search-item">
              <div className="saved-search-info">
                <h4>{search.name}</h4>
                <p className="filter-summary">{getFilterSummary(search.filters)}</p>
                <p className="search-meta">
                  Created {formatDate(search.createdAt)}
                  {search.lastUsed && ` • Last used ${formatDate(search.lastUsed)}`}
                </p>
              </div>
              
              <div className="saved-search-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleLoadSearch(search)}
                  title="Load this search"
                >
                  Load
                </button>
                <button
                  className={`btn btn-sm ${deleteConfirm === search.id ? 'btn-danger-confirm' : 'btn-danger'}`}
                  onClick={() => handleDelete(search.id)}
                  title={deleteConfirm === search.id ? 'Click again to confirm' : 'Delete this search'}
                >
                  {deleteConfirm === search.id ? 'Confirm?' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
