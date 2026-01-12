import { useState, useEffect } from 'react';
import { SavedDealsService } from '../services/savedDeals';
import { SavedDeal } from '../types/savedDeals';
import { DealCard } from '../components/DealCard';

export default function SavedDeals() {
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);

  useEffect(() => {
    loadSavedDeals();
  }, []);

  const loadSavedDeals = () => {
    setLoading(true);
    const deals = SavedDealsService.getAll();
    setSavedDeals(deals);

    // Check for expired deals
    const expired = SavedDealsService.getExpiredDeals();
    if (expired.length > 0) {
      setExpiredCount(expired.length);
      setShowExpiredWarning(true);
    }

    setLoading(false);
  };

  const handleRemoveExpired = () => {
    const removed = SavedDealsService.removeExpired();
    if (removed > 0) {
      loadSavedDeals();
      setShowExpiredWarning(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to remove all ${savedDeals.length} saved deals?`)) {
      SavedDealsService.clear();
      loadSavedDeals();
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading saved deals...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="saved-deals-header">
        <div>
          <h1>Saved Deals</h1>
          <p className="saved-deals-subtitle">
            {savedDeals.length === 0
              ? 'You haven\'t saved any deals yet'
              : `You have ${savedDeals.length} saved deal${savedDeals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {savedDeals.length > 0 && (
          <button className="clear-all-button" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      {showExpiredWarning && expiredCount > 0 && (
        <div className="expired-warning">
          <div className="expired-warning-content">
            <span className="expired-warning-icon">⚠️</span>
            <div>
              <strong>Expired Deals</strong>
              <p>
                {expiredCount} deal{expiredCount !== 1 ? 's have' : ' has'} passed the booking
                deadline and may no longer be available.
              </p>
            </div>
          </div>
          <button className="expired-warning-button" onClick={handleRemoveExpired}>
            Remove Expired
          </button>
        </div>
      )}

      {savedDeals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤍</div>
          <h2>No Saved Deals</h2>
          <p>
            Start browsing deals and click the heart icon to save your favorites here.
          </p>
          <a href="/" className="empty-state-button">
            Browse Deals
          </a>
        </div>
      ) : (
        <div className="saved-deals-grid">
          {savedDeals.map((savedDeal) => (
            <div key={savedDeal.id} className="saved-deal-wrapper">
              <DealCard deal={savedDeal.deal} />
              <div className="saved-deal-meta">
                <div className="saved-deal-info">
                  <span className="saved-deal-time">
                    Saved {formatRelativeTime(savedDeal.savedAt)}
                  </span>
                  {isExpired(savedDeal.expiresAt) && (
                    <span className="saved-deal-expired">⚠️ Expired</span>
                  )}
                </div>
                {savedDeal.notes && (
                  <div className="saved-deal-notes">
                    <strong>Notes:</strong> {savedDeal.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
