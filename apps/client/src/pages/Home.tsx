import { DealsGrid } from '../components/DealsGrid';

export default function Home() {
  return (
    <div className="page-container">
      <div className="hero-section">
        <h1>Discover Amazing Travel Deals</h1>
        <p className="hero-subtitle">
          Find the best travel packages, flights, and accommodations at unbeatable prices
        </p>
      </div>
      
      <DealsGrid />
    </div>
  );
}
