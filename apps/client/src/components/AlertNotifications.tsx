import React, { useState, useEffect } from 'react';
import { AlertNotification } from '../types/alerts';
import { PriceAlertsService } from '../services/priceAlerts';

interface AlertNotificationsProps {
  onNotificationClick?: (dealId: string) => void;
}

export const AlertNotifications: React.FC<AlertNotificationsProps> = ({
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications = PriceAlertsService.getAllNotifications();
    setNotifications(allNotifications);
  };

  const handleMarkAsRead = (id: string) => {
    PriceAlertsService.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    PriceAlertsService.markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleDelete = (id: string) => {
    PriceAlertsService.deleteNotification(id);
    loadNotifications();
  };

  const handleNotificationClick = (notification: AlertNotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification.dealId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getSavingsAmount = (notification: AlertNotification): number => {
    return notification.targetPrice - notification.dealPrice;
  };

  const getSavingsPercent = (notification: AlertNotification): number => {
    return Math.round((getSavingsAmount(notification) / notification.targetPrice) * 100);
  };

  if (notifications.length === 0) {
    return null; // Don't show section if no notifications
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="alert-notifications-container">
      <div className="alert-notifications-header">
        <h3>
          🔔 Notifications ({notifications.length})
          {unreadCount > 0 && <span className="unread-badge">{unreadCount} new</span>}
        </h3>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button
              className="btn-link"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
          <button
            className="toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="alert-notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.dealTitle}</h4>
                  {!notification.isRead && <span className="unread-dot"></span>}
                </div>
                
                <p className="notification-message">
                  <strong>Price Alert!</strong> Deal to {notification.destination} is now{' '}
                  <strong>${notification.dealPrice}</strong> (your target: ${notification.targetPrice})
                </p>
                
                <div className="notification-savings">
                  <span className="savings-badge">
                    Save ${getSavingsAmount(notification)} ({getSavingsPercent(notification)}% below target)
                  </span>
                </div>
                
                <p className="notification-time">{formatDate(notification.createdAt)}</p>
              </div>
              
              <div className="notification-actions">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  title="Delete notification"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
