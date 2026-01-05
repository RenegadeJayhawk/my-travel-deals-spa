import { useState, useEffect } from 'react';
import { dealsApi, ApiError } from '../services/api';
import type { TravelDeal } from '../types/deals';
import type { FilterState } from '../types/filters';
import { DealCard } from './DealCard';

interface DealsGridProps {
  filters: FilterState;
}

export function DealsGrid({ filters }: DealsGridProps) {
  const [deals, setDeals] = useState<TravelDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters from filters
        const params: Record<string, string> = {};
        if (filters.destination) params.destination = filters.destination;
        if (filters.minPrice > 0) params.minPrice = filters.minPrice.toString();
        if (filters.maxPrice < 5000) params.maxPrice = filters.maxPrice.toString();
        if (filters.dealType) params.dealType = filters.dealType;
        
        const response = await dealsApi.getDeals(params);
        let filteredDeals = response.deals;

        // Client-side filtering for search
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredDeals = filteredDeals.filter(
            (deal) =>
              deal.title.toLowerCase().includes(searchLower) ||
              deal.destination.toLowerCase().includes(searchLower) ||
              deal.origin.toLowerCase().includes(searchLower)
          );
        }

        // Client-side sorting
        filteredDeals = [...filteredDeals].sort((a, b) => {
          switch (filters.sortBy) {
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            case 'quality-desc':
              return b.quality_score - a.quality_score;
            case 'date-asc':
              return new Date(a.travel_start_date).getTime() - new Date(b.travel_start_date).getTime();
            default:
              return 0;
          }
        });

        setDeals(filteredDeals);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [filters]);

  if (loading) {
    return (
      <div className="deals-grid-container">
        <div className="deals-grid-loading">
          <div className="spinner"></div>
          <p>Loading amazing travel deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deals-grid-container">
        <div className="deals-grid-error">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="deals-grid-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="deals-grid-container">
        <div className="deals-grid-empty">
          <h3>No deals found</h3>
          <p>Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deals-grid-container">
      <div className="deals-grid-header">
        <h2>Featured Travel Deals</h2>
        <p className="deals-grid-count">
          {deals.length} {deals.length === 1 ? 'deal' : 'deals'} available
        </p>
      </div>
      
      <div className="deals-grid">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
