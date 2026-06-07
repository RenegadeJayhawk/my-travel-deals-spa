import { Link } from 'react-router-dom';
import { useCompareSelection } from '../context/CompareContext';

export default function Compare() {
  const { selectedDeals, toggleCompare } = useCompareSelection();

  if (selectedDeals.length === 0) {
    return (
      <div className="page-container compare-page">
        <div className="empty-state">
          <h2>No Deals Selected</h2>
          <p>You haven't selected any deals to compare yet.</p>
          <Link to="/" className="back-btn">Browse Deals</Link>
        </div>
      </div>
    );
  }

  const getLowestPrice = () => {
    return Math.min(...selectedDeals.map(d => d.price));
  };

  const getHighestQuality = () => {
    return Math.max(...selectedDeals.map(d => d.qualityScore));
  };

  const lowestPrice = getLowestPrice();
  const highestQuality = getHighestQuality();

  const renderBestValue = (value: string | number, isBest: boolean, icon = '✨') => {
    if (!isBest) return value;
    return (
      <span className="best-value">
        {icon} {value}
      </span>
    );
  };

  return (
    <div className="page-container compare-page">
      <h1>Compare Deals</h1>
      
      <div className="compare-table-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">Features</th>
              {selectedDeals.map((deal) => (
                <th key={deal.id} scope="col" className="deal-column-header">
                  {deal.imageUrl && <img src={deal.imageUrl} alt={deal.title} />}
                  <h3>{deal.title}</h3>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Destination</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell">📍 {deal.destination}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Price</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell">
                  {renderBestValue(`$${deal.price}`, deal.price === lowestPrice, '💰')}
                  {deal.originalPrice && (
                    <div style={{ textDecoration: 'line-through', color: '#7f8c8d', fontSize: '0.9em' }}>
                      ${deal.originalPrice}
                    </div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Quality Score</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell">
                  {renderBestValue(`${deal.qualityScore}%`, deal.qualityScore === highestQuality, '⭐')}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Deal Type</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell">{deal.dealType}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Provider</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell">{deal.provider} ({deal.providerType})</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Travel Dates</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell">
                  {new Date(deal.travelDates.start).toLocaleDateString()} - <br/>
                  {new Date(deal.travelDates.end).toLocaleDateString()}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Inclusions</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell">
                  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                    {deal.inclusions.map((inc, i) => <li key={i}>{inc}</li>)}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Actions</th>
              {selectedDeals.map((deal) => (
                <td key={deal.id} className="data-cell" style={{ textAlign: 'center' }}>
                  <a href={deal.url} target="_blank" rel="noopener noreferrer" className="back-btn" style={{ width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem' }}>
                    View Deal
                  </a>
                  <button className="remove-deal-btn" onClick={() => toggleCompare(deal)}>
                    Remove
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <Link to="/" className="back-btn" style={{ background: '#7f8c8d' }}>← Back to Search</Link>
      </div>
    </div>
  );
}
