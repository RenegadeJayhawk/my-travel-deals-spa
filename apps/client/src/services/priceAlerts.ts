import { PriceAlert, AlertNotification } from '../types/alerts';

const ALERTS_STORAGE_KEY = 'travel-deals-price-alerts';
const NOTIFICATIONS_STORAGE_KEY = 'travel-deals-alert-notifications';

/**
 * Service for managing price alerts in LocalStorage
 * Provides CRUD operations for price alert configurations
 */
export class PriceAlertsService {
  /**
   * Get all price alerts from LocalStorage
   */
  static getAll(): PriceAlert[] {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (!stored) return [];
      
      const alerts = JSON.parse(stored) as PriceAlert[];
      return alerts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error loading price alerts:', error);
      return [];
    }
  }

  /**
   * Get only active alerts
   */
  static getActive(): PriceAlert[] {
    return this.getAll().filter(alert => alert.isActive);
  }

  /**
   * Create a new price alert
   */
  static create(destination: string, targetPrice: number, dealType?: string): PriceAlert {
    const alerts = this.getAll();
    
    const newAlert: PriceAlert = {
      id: this.generateId(),
      destination: destination.trim(),
      targetPrice,
      dealType,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    alerts.push(newAlert);
    this.persist(alerts);
    
    return newAlert;
  }

  /**
   * Update an existing alert
   */
  static update(id: string, updates: Partial<PriceAlert>): PriceAlert | null {
    const alerts = this.getAll();
    const index = alerts.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    alerts[index] = {
      ...alerts[index],
      ...updates,
    };
    
    this.persist(alerts);
    return alerts[index];
  }

  /**
   * Delete an alert by ID
   */
  static delete(id: string): boolean {
    const alerts = this.getAll();
    const filtered = alerts.filter(a => a.id !== id);
    
    if (filtered.length === alerts.length) return false;
    
    this.persist(filtered);
    return true;
  }

  /**
   * Toggle alert active status
   */
  static toggleActive(id: string): boolean {
    const alert = this.getById(id);
    if (!alert) return false;
    
    this.update(id, { isActive: !alert.isActive });
    return true;
  }

  /**
   * Mark alert as checked
   */
  static markAsChecked(id: string): void {
    this.update(id, {
      lastChecked: new Date().toISOString(),
    });
  }

  /**
   * Mark alert as triggered
   */
  static markAsTriggered(id: string): void {
    this.update(id, {
      triggeredAt: new Date().toISOString(),
      notificationSent: true,
    });
  }

  /**
   * Get alert by ID
   */
  static getById(id: string): PriceAlert | null {
    const alerts = this.getAll();
    return alerts.find(a => a.id === id) || null;
  }

  /**
   * Check if similar alert exists
   */
  static similarExists(destination: string, targetPrice: number, dealType?: string): boolean {
    const alerts = this.getActive();
    return alerts.some(a => 
      a.destination.toLowerCase() === destination.toLowerCase().trim() &&
      a.targetPrice === targetPrice &&
      a.dealType === dealType
    );
  }

  /**
   * Clear all alerts
   */
  static clear(): void {
    localStorage.removeItem(ALERTS_STORAGE_KEY);
  }

  /**
   * Persist alerts to LocalStorage
   */
  private static persist(alerts: PriceAlert[]): void {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
      throw new Error('Failed to save alert. Storage may be full.');
    }
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== Notifications Management =====

  /**
   * Get all notifications
   */
  static getAllNotifications(): AlertNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) return [];
      
      const notifications = JSON.parse(stored) as AlertNotification[];
      return notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notifications
   */
  static getUnreadNotifications(): AlertNotification[] {
    return this.getAllNotifications().filter(n => !n.isRead);
  }

  /**
   * Create a notification
   */
  static createNotification(
    alertId: string,
    dealId: string,
    dealTitle: string,
    dealPrice: number,
    targetPrice: number,
    destination: string
  ): AlertNotification {
    const notifications = this.getAllNotifications();
    
    const notification: AlertNotification = {
      id: this.generateId(),
      alertId,
      dealId,
      dealTitle,
      dealPrice,
      targetPrice,
      destination,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    notifications.push(notification);
    this.persistNotifications(notifications);
    
    return notification;
  }

  /**
   * Mark notification as read
   */
  static markNotificationAsRead(id: string): void {
    const notifications = this.getAllNotifications();
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      notifications[index].isRead = true;
      this.persistNotifications(notifications);
    }
  }

  /**
   * Mark all notifications as read
   */
  static markAllNotificationsAsRead(): void {
    const notifications = this.getAllNotifications();
    notifications.forEach(n => n.isRead = true);
    this.persistNotifications(notifications);
  }

  /**
   * Delete a notification
   */
  static deleteNotification(id: string): boolean {
    const notifications = this.getAllNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    
    if (filtered.length === notifications.length) return false;
    
    this.persistNotifications(filtered);
    return true;
  }

  /**
   * Clear all notifications
   */
  static clearNotifications(): void {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  }

  /**
   * Persist notifications to LocalStorage
   */
  private static persistNotifications(notifications: AlertNotification[]): void {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }
}
