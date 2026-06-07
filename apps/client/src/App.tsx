import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import SavedDeals from './pages/SavedDeals'
import Compare from './pages/Compare'
import { SavedDealsService } from './services/savedDeals'
import { CompareProvider } from './context/CompareContext'
import { CompareBar } from './components/CompareBar'
import './styles/compare.css'

function Navigation() {
  const [savedCount, setSavedCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Update count whenever location changes
    setSavedCount(SavedDealsService.getCount());
  }, [location]);

  return (
    <nav
      style={{
        padding: '1rem',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', color: '#0066cc' }}>
        Home
      </Link>
      <Link
        to="/saved"
        style={{
          textDecoration: 'none',
          color: '#0066cc',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        Saved Deals
        {savedCount > 0 && (
          <span
            style={{
              background: '#dc3545',
              color: 'white',
              borderRadius: '12px',
              padding: '0.125rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            {savedCount}
          </span>
        )}
      </Link>
    </nav>
  );
}

function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <div style={{ fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>
          <Navigation />

          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/saved" element={<SavedDeals />} />
              <Route path="/compare" element={<Compare />} />
            </Routes>
          </main>
          
          <CompareBar />
        </div>
      </BrowserRouter>
    </CompareProvider>
  )
}

export default App
