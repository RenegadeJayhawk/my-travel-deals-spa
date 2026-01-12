import { useState, useEffect } from 'react';
import type { TravelDeal } from '../types/deals';
import { SavedDealsService } from '../services/savedDeals';

interface DealCardProps {
  deal: TravelDeal;
}

export function DealCard({ deal }: DealCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(SavedDealsService.isSaved(deal.id));
  }, [deal.id]);

  const savings = deal.originalPrice
    ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
    : 0;

  const handleSaveToggle = () => {
    try {
      if (isSaved) {
        SavedDealsService.unsave(deal.id);
        setIsSaved(false);
      } else {
        SavedDealsService.save(deal);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="deal-card">
      {deal.imageUrl && (
        <div className="deal-card-image">
          <img src={deal.imageUrl} alt={deal.title} loading="lazy" />
          {savings > 0 && (
            <div className="deal-card-badge">Save {savings}%</div>
          )}
        </div>
      )}
      
      <div className="deal-card-content">
        <div className="deal-card-header">
          <div className="deal-card-header-left">
            <h3 className="deal-card-title">{deal.title}</h3>
            <div className="deal-card-type">{deal.dealType}</div>
          </div>
          <button
            className={`deal-card-save-button ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveToggle}
            title={isSaved ? 'Unsave deal' : 'Save deal'}
            aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="deal-card-destination">
          <span className="deal-card-icon">📍</span>
          {deal.destination}
        </div>

        <div className="deal-card-dates">
          <span className="deal-card-icon">📅</span>
          {formatDate(deal.travelDates.start)} - {formatDate(deal.travelDates.end)}
        </div>

        <div className="deal-card-inclusions">
          {deal.inclusions.slice(0, 3).map((inclusion, index) => (
            <span key={index} className="deal-card-inclusion">
              ✓ {inclusion}
            </span>
          ))}
          {deal.inclusions.length > 3 && (
            <span className="deal-card-inclusion-more">
              +{deal.inclusions.length - 3} more
            </span>
          )}
        </div>

        <div className="deal-card-footer">
          <div className="deal-card-price">
            {deal.originalPrice && (
              <span className="deal-card-original-price">
                ${deal.originalPrice}
              </span>
            )}
            <span className="deal-card-current-price">
              ${deal.price}
            </span>
            <span className="deal-card-currency">per person</span>
          </div>

          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="deal-card-button"
          >
            View Deal
          </a>
        </div>

        <div className="deal-card-meta">
          <span className="deal-card-provider">{deal.provider}</span>
          <span className="deal-card-quality">
            ⭐ {deal.qualityScore}% Quality
          </span>
        </div>
      </div>
    </div>
  );
}
