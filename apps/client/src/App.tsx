import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import SavedDeals from './pages/SavedDeals'

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <nav
          style={{
            padding: '1rem',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            gap: '1rem',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: '#0066cc' }}>
            Home
          </Link>
          <Link to="/saved" style={{ textDecoration: 'none', color: '#0066cc' }}>
            Saved Deals
          </Link>
        </nav>

        <main style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/saved" element={<SavedDeals />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
