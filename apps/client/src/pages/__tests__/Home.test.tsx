import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

vi.mock('../../components/DealsGrid', () => ({
  DealsGrid: () => <div data-testid="deals-grid" />
}));

vi.mock('../../components/SearchBar', () => ({
  SearchBar: ({ onChange }: any) => (
    <input data-testid="search-bar" onChange={(e) => onChange(e.target.value)} />
  )
}));

vi.mock('../../components/FilterPanel', () => ({
  FilterPanel: () => <div data-testid="filter-panel" />
}));

vi.mock('../../components/SaveSearchModal', () => ({
  SaveSearchModal: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="save-search-modal"><button onClick={onClose}>Close</button></div> : null
}));

vi.mock('../../components/CreateAlertModal', () => ({
  CreateAlertModal: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="create-alert-modal"><button onClick={onClose}>Close</button></div> : null
}));

vi.mock('../../components/SavedSearchesList', () => ({
  SavedSearchesList: () => <div data-testid="saved-searches-list" />
}));

vi.mock('../../components/PriceAlertsList', () => ({
  PriceAlertsList: () => <div data-testid="price-alerts-list" />
}));

vi.mock('../../components/AlertNotifications', () => ({
  AlertNotifications: () => <div data-testid="alert-notifications" />
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  it('renders initial components', () => {
    renderHome();
    
    expect(screen.getByText('Discover Amazing Travel Deals')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('deals-grid')).toBeInTheDocument();
    expect(screen.getByTestId('saved-searches-list')).toBeInTheDocument();
    expect(screen.getByTestId('price-alerts-list')).toBeInTheDocument();
    expect(screen.getByTestId('alert-notifications')).toBeInTheDocument();
  });

  it('toggles filters panel', () => {
    renderHome();
    
    // Initial state: not shown
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    
    // Click toggle
    fireEvent.click(screen.getByText('⚙ Show Filters'));
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    expect(screen.getByText('✕ Hide Filters')).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(screen.getByText('✕ Hide Filters'));
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
  });

  it('opens and closes Save Search modal', () => {
    renderHome();
    
    expect(screen.queryByTestId('save-search-modal')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('💾 Save Search'));
    expect(screen.getByTestId('save-search-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('save-search-modal')).not.toBeInTheDocument();
  });

  it('opens and closes Create Alert modal', () => {
    renderHome();
    
    expect(screen.queryByTestId('create-alert-modal')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('🔔 Create Alert'));
    expect(screen.getByTestId('create-alert-modal')).toBeInTheDocument();
    
    // Select the close button from the modal mock
    const closeBtns = screen.getAllByText('Close');
    fireEvent.click(closeBtns[0]);
    expect(screen.queryByTestId('create-alert-modal')).not.toBeInTheDocument();
  });
});
