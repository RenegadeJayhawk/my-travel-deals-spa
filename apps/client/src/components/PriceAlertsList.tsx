import React, { useState, useEffect, useRef } from 'react';
import { PriceAlert } from '../types/alerts';
import { PriceAlertsService } from '../services/priceAlerts';

interface PriceAlertsListProps {
  onRefresh?: () => void;
}

export const PriceAlertsList: React.FC<PriceAlertsListProps> = ({ onRefresh }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAlerts();
    
    // Cleanup timeout on unmount
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const loadAlerts = () => {
    const allAlerts = PriceAlertsService.getAll();
    setAlerts(allAlerts);
    if (onRefresh) onRefresh();
  };

  const handleToggleActive = (id: string) => {
    PriceAlertsService.toggleActive(id);
    loadAlerts();
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      // Second click - confirm deletion
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
        deleteTimeoutRef.current = null;
      }
      PriceAlertsService.delete(id);
      loadAlerts();
      setDeleteConfirm(null);
    } else {
      // First click - enter confirmation mode
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      setDeleteConfirm(id);
      deleteTimeoutRef.current = setTimeout(() => {
        setDeleteConfirm(null);
        deleteTimeoutRef.current = null;
      }, 3000);
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

  const getAlertSummary = (alert: PriceAlert): string => {
    const parts: string[] = [];
    
    parts.push(`≤ $${alert.targetPrice}`);
    if (alert.dealType) {
      parts.push(alert.dealType);
    }
    
    return parts.join(' • ');
  };

  const getAlertStatus = (alert: PriceAlert): { label: string; className: string } => {
    if (!alert.isActive) {
      return { label: 'Paused', className: 'status-paused' };
    }
    if (alert.triggeredAt) {
      return { label: 'Triggered', className: 'status-triggered' };
    }
    return { label: 'Active', className: 'status-active' };
  };

  if (alerts.length === 0) {
    return (
      <div className="price-alerts-empty">
        <p>No price alerts yet. Create an alert to get notified when prices drop!</p>
      </div>
    );
  }

  const activeCount = alerts.filter(a => a.isActive).length;

  return (
    <div className="price-alerts-container">
      <div className="price-alerts-header">
        <h3>
          Price Alerts ({alerts.length})
          {activeCount > 0 && <span className="active-badge">{activeCount} active</span>}
        </h3>
        <button
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="price-alerts-list">
          {alerts.map((alert) => {
            const status = getAlertStatus(alert);
            
            return (
              <div key={alert.id} className={`price-alert-item ${!alert.isActive ? 'inactive' : ''}`}>
                <div className="alert-info">
                  <div className="alert-header">
                    <h4>{alert.destination}</h4>
                    <span className={`alert-status ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="alert-summary">{getAlertSummary(alert)}</p>
                  <p className="alert-meta">
                    Created {formatDate(alert.createdAt)}
                    {alert.lastChecked && ` • Last checked ${formatDate(alert.lastChecked)}`}
                    {alert.triggeredAt && ` • Triggered ${formatDate(alert.triggeredAt)}`}
                  </p>
                </div>
                
                <div className="alert-actions">
                  <button
                    className={`btn btn-sm ${alert.isActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleActive(alert.id)}
                    title={alert.isActive ? 'Pause alert' : 'Resume alert'}
                  >
                    {alert.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    className={`btn btn-sm ${deleteConfirm === alert.id ? 'btn-danger-confirm' : 'btn-danger'}`}
                    onClick={() => handleDelete(alert.id)}
                    title={deleteConfirm === alert.id ? 'Click again to confirm' : 'Delete this alert'}
                  >
                    {deleteConfirm === alert.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
