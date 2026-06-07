import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateAlertModal } from '../CreateAlertModal';
import { PriceAlertsService } from '../../services/priceAlerts';

vi.mock('../../services/priceAlerts', () => ({
  PriceAlertsService: {
    similarExists: vi.fn(),
    create: vi.fn(),
  }
}));

describe('CreateAlertModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CreateAlertModal isOpen={false} onClose={mockOnClose} onCreated={mockOnCreated} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when open', () => {
    render(
      <CreateAlertModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />
    );
    
    expect(screen.getByText('Create Price Alert')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Price (USD)')).toBeInTheDocument();
  });

  it('validates empty destination', async () => {
    render(
      <CreateAlertModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />
    );
    
    fireEvent.click(screen.getByText('Create Alert'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a destination')).toBeInTheDocument();
    });
  });

  it('validates invalid price', async () => {
    render(
      <CreateAlertModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} initialDestination="Paris" />
    );
    
    // Default price is empty
    fireEvent.click(screen.getByText('Create Alert'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid price')).toBeInTheDocument();
    });
    
    // Zero price
    fireEvent.change(screen.getByLabelText('Target Price (USD)'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Create Alert'));
    await waitFor(() => {
      expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
    });
  });

  it('shows error if similar alert exists', async () => {
    vi.mocked(PriceAlertsService.similarExists).mockReturnValue(true);
    
    render(
      <CreateAlertModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />
    );
    
    fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByLabelText('Target Price (USD)'), { target: { value: '1000' } });
    
    fireEvent.click(screen.getByText('Create Alert'));
    
    await waitFor(() => {
      expect(screen.getByText('A similar alert already exists for this destination and price')).toBeInTheDocument();
    });
  });

  it('creates alert successfully and calls callbacks', async () => {
    vi.mocked(PriceAlertsService.similarExists).mockReturnValue(false);
    
    render(
      <CreateAlertModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />
    );
    
    fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByLabelText('Target Price (USD)'), { target: { value: '1000' } });
    
    fireEvent.click(screen.getByText('Create Alert'));
    
    await waitFor(() => {
      expect(PriceAlertsService.create).toHaveBeenCalledWith('Paris', 1000, undefined);
      expect(mockOnCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <CreateAlertModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
