import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AlertNotifications } from '../AlertNotifications';
import { PriceAlertsService } from '../../services/priceAlerts';

vi.mock('../../services/priceAlerts', () => ({
  PriceAlertsService: {
    getAllNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  }
}));

const mockNotifications = [
  {
    id: 'n1',
    alertId: 'a1',
    dealId: 'd1',
    dealTitle: 'Paris Flight',
    destination: 'Paris',
    targetPrice: 1000,
    dealPrice: 800,
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'n2',
    alertId: 'a2',
    dealId: 'd2',
    dealTitle: 'Tokyo Hotel',
    destination: 'Tokyo',
    targetPrice: 2000,
    dealPrice: 1900,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: true,
  }
];

describe('AlertNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when no notifications exist', () => {
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue([]);
    const { container } = render(<AlertNotifications />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header with count and unread badge', () => {
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue(mockNotifications);
    render(<AlertNotifications />);
    
    expect(screen.getByText('🔔 Notifications (2)')).toBeInTheDocument();
    expect(screen.getByText('1 new')).toBeInTheDocument();
  });

  it('expands list when toggle button is clicked', () => {
    // Only use the read notification so it doesn't auto-expand
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue([mockNotifications[1]]);
    render(<AlertNotifications />);
    
    // Initially collapsed
    expect(screen.queryByText('Tokyo Hotel')).not.toBeInTheDocument();
    
    // Click expand
    fireEvent.click(screen.getByLabelText('Expand'));
    expect(screen.getByText('Tokyo Hotel')).toBeInTheDocument();
  });

  it('auto-expands when new unread notification arrives during polling', () => {
    // Start with 1 read notification
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue([mockNotifications[1]]);
    render(<AlertNotifications />);
    
    expect(screen.queryByText('Tokyo Hotel')).not.toBeInTheDocument(); // Collapsed
    
    // Mock new unread notification arriving
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue(mockNotifications);
    
    act(() => {
      vi.advanceTimersByTime(5000); // Trigger poll
    });
    
    // Should be auto-expanded now
    expect(screen.getByText('Paris Flight')).toBeInTheDocument();
  });

  it('marks single notification as read on click', () => {
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue(mockNotifications);
    const handleClick = vi.fn();
    render(<AlertNotifications onNotificationClick={handleClick} />);
    
    // It auto-expands
    fireEvent.click(screen.getByText('Paris Flight'));
    
    expect(PriceAlertsService.markNotificationAsRead).toHaveBeenCalledWith('n1');
    expect(handleClick).toHaveBeenCalledWith('d1');
  });

  it('marks all as read', () => {
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue(mockNotifications);
    render(<AlertNotifications />);
    
    fireEvent.click(screen.getByText('Mark all as read'));
    expect(PriceAlertsService.markAllNotificationsAsRead).toHaveBeenCalled();
  });

  it('deletes notification', () => {
    vi.mocked(PriceAlertsService.getAllNotifications).mockReturnValue(mockNotifications);
    render(<AlertNotifications />);
    
    // It auto-expands because there is an unread notification in mockNotifications.
    const deleteBtns = screen.getAllByTitle('Delete notification');
    fireEvent.click(deleteBtns[0]); // delete Paris Flight
    
    expect(PriceAlertsService.deleteNotification).toHaveBeenCalledWith('n1');
  });
});
