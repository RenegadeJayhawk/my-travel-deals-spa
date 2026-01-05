import React from 'react';
import { FilterState, DEFAULT_FILTERS, DEAL_TYPES } from '../types/filters';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={onReset} className="filter-reset">
          Reset All
        </button>
      </div>

      <div className="filter-group">
        <label htmlFor="destination">Destination</label>
        <input
          id="destination"
          type="text"
          value={filters.destination}
          onChange={(e) => onFilterChange({ destination: e.target.value })}
          placeholder="e.g., Paris, Tokyo"
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="dealType">Deal Type</label>
        <select
          id="dealType"
          value={filters.dealType}
          onChange={(e) => onFilterChange({ dealType: e.target.value })}
          className="filter-select"
        >
          {DEAL_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-range">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              onFilterChange({ minPrice: Number(e.target.value) })
            }
            min="0"
            max={filters.maxPrice}
            placeholder="Min"
            className="filter-input price-input"
          />
          <span>to</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              onFilterChange({ maxPrice: Number(e.target.value) })
            }
            min={filters.minPrice}
            placeholder="Max"
            className="filter-input price-input"
          />
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="startDate">Travel Start Date</label>
        <input
          id="startDate"
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="endDate">Travel End Date</label>
        <input
          id="endDate"
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
          min={filters.startDate}
          className="filter-input"
        />
      </div>
    </div>
  );
};
