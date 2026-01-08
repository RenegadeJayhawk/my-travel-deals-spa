import React, { useState } from 'react';
import { PriceAlertsService } from '../services/priceAlerts';
import { DEAL_TYPES } from '../types/filters';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialDestination?: string;
  initialPrice?: number;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  initialDestination = '',
  initialPrice,
}) => {
  const [destination, setDestination] = useState(initialDestination);
  const [targetPrice, setTargetPrice] = useState(initialPrice?.toString() || '');
  const [dealType, setDealType] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const trimmedDestination = destination.trim();
    const price = parseFloat(targetPrice);
    
    // Validation
    if (!trimmedDestination) {
      setError('Please enter a destination');
      return;
    }

    if (!targetPrice || isNaN(price)) {
      setError('Please enter a valid price');
      return;
    }

    if (price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (price > 50000) {
      setError('Price must be less than $50,000');
      return;
    }

    // Check for similar alert
    if (PriceAlertsService.similarExists(trimmedDestination, price, dealType || undefined)) {
      setError('A similar alert already exists for this destination and price');
      return;
    }

    // Create alert
    setIsCreating(true);
    try {
      PriceAlertsService.create(trimmedDestination, price, dealType || undefined);
      setDestination('');
      setTargetPrice('');
      setDealType('');
      setError('');
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setDestination(initialDestination);
    setTargetPrice(initialPrice?.toString() || '');
    setDealType('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Price Alert</h2>
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
            Get notified when deals to your destination drop below your target price.
          </p>

          <div className="form-group">
            <label htmlFor="alert-destination">Destination</label>
            <input
              id="alert-destination"
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setError('');
              }}
              placeholder="e.g., Paris, Tokyo, Cancun"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="alert-price">Target Price (USD)</label>
            <input
              id="alert-price"
              type="number"
              value={targetPrice}
              onChange={(e) => {
                setTargetPrice(e.target.value);
                setError('');
              }}
              placeholder="e.g., 1000"
              min="1"
              max="50000"
              step="1"
            />
            <span className="input-hint">
              You'll be notified when deals are at or below this price
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="alert-deal-type">Deal Type (Optional)</label>
            <select
              id="alert-deal-type"
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
            >
              {DEAL_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};
