import { useNavigate } from 'react-router-dom';
import { useCompareSelection } from '../context/CompareContext';

export function CompareBar() {
  const { selectedDeals, clearComparison } = useCompareSelection();
  const navigate = useNavigate();

  if (selectedDeals.length === 0) {
    return null;
  }

  return (
    <div className="compare-bar" role="region" aria-label="Compare Deals">
      <div className="compare-bar-content">
        <span className="compare-bar-text">
          {selectedDeals.length} {selectedDeals.length === 1 ? 'deal' : 'deals'} selected for comparison
        </span>
        <div className="compare-bar-actions">
          <button
            className="compare-bar-btn compare-bar-btn-clear"
            onClick={clearComparison}
          >
            Clear
          </button>
          <button
            className="compare-bar-btn compare-bar-btn-primary"
            onClick={() => navigate('/compare')}
            disabled={selectedDeals.length < 2}
            title={selectedDeals.length < 2 ? 'Select at least 2 deals to compare' : 'Compare selected deals'}
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
}
