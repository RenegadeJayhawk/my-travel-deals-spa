import React, { useState } from 'react';
import { FilterState } from '../types/filters';
import { SavedSearchesService } from '../services/savedSearches';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onSaved: () => void;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    
    // Validation
    if (!trimmedName) {
      setError('Please enter a name for this search');
      return;
    }

    if (trimmedName.length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Name must be less than 50 characters');
      return;
    }

    if (SavedSearchesService.nameExists(trimmedName)) {
      setError('A search with this name already exists');
      return;
    }

    // Save
    setIsSaving(true);
    try {
      SavedSearchesService.save(trimmedName, currentFilters);
      setName('');
      setError('');
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save search');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Current Search</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Save your current filter settings to quickly access them later.
          </p>

          <div className="form-group">
            <label htmlFor="search-name">Search Name</label>
            <input
              id="search-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Summer Beach Vacations"
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleClose();
              }}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="current-filters-preview">
            <h4>Current Filters:</h4>
            <ul>
              {currentFilters.search && (
                <li><strong>Search:</strong> {currentFilters.search}</li>
              )}
              {currentFilters.destination && (
                <li><strong>Destination:</strong> {currentFilters.destination}</li>
              )}
              {currentFilters.dealType && (
                <li><strong>Deal Type:</strong> {currentFilters.dealType}</li>
              )}
              {(currentFilters.minPrice > 0 || currentFilters.maxPrice < 5000) && (
                <li>
                  <strong>Price:</strong> ${currentFilters.minPrice} - ${currentFilters.maxPrice}
                </li>
              )}
              {currentFilters.startDate && (
                <li><strong>Start Date:</strong> {currentFilters.startDate}</li>
              )}
              {currentFilters.endDate && (
                <li><strong>End Date:</strong> {currentFilters.endDate}</li>
              )}
              {currentFilters.sortBy !== 'price-asc' && (
                <li><strong>Sort:</strong> {currentFilters.sortBy}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Search'}
          </button>
        </div>
      </div>
    </div>
  );
};
