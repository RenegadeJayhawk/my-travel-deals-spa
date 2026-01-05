import { useState, useEffect } from 'react';
import { dealsApi, ApiError } from '../services/api';
import type { TravelDeal } from '../types/deals';
import { DealCard } from './DealCard';

export function DealsGrid() {
  const [deals, setDeals] = useState<TravelDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dealsApi.getDeals();
        setDeals(response.deals);
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
  }, []);

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
          <h3>No deals available</h3>
          <p>Check back soon for amazing travel deals!</p>
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
