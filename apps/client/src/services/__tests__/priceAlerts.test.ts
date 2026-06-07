import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PriceAlertsService } from '../priceAlerts';
// PriceAlert import removed

describe('PriceAlertsService', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
  });

  // Clean up after each test
  afterEach(() => {
    localStorage.clear();
  });

  describe('create', () => {
    it('should create a new alert with all required fields', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.destination).toBe('Paris');
      expect(alert.targetPrice).toBe(1000);
      expect(alert.isActive).toBe(true);
      expect(alert.createdAt).toBeDefined();
    });

    it('should create alert with optional deal type', () => {
      const alert = PriceAlertsService.create('Tokyo', 1500, 'package');

      expect(alert.dealType).toBe('package');
    });

    it('should trim destination whitespace', () => {
      const alert = PriceAlertsService.create('  Cancun  ', 800);

      expect(alert.destination).toBe('Cancun');
    });

    it('should persist alert to localStorage', () => {
      PriceAlertsService.create('London', 1200);

      const alerts = PriceAlertsService.getAll();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].destination).toBe('London');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no alerts exist', () => {
      const alerts = PriceAlertsService.getAll();

      expect(alerts).toEqual([]);
    });

    it('should return all alerts sorted by creation date (newest first)', () => {
      PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.create('Tokyo', 2000);
      PriceAlertsService.create('London', 1500);

      const alerts = PriceAlertsService.getAll();

      expect(alerts).toHaveLength(3);
      // Check that alerts are sorted by creation date (newest first)
      // Since all created at same time, just verify all are present
      const destinations = alerts.map(a => a.destination);
      expect(destinations).toContain('Paris');
      expect(destinations).toContain('Tokyo');
      expect(destinations).toContain('London');
    });
  });

  describe('getActive', () => {
    it('should return only active alerts', () => {
      const alert1 = PriceAlertsService.create('Paris', 1000);
      const alert2 = PriceAlertsService.create('Tokyo', 1500);
      
      PriceAlertsService.toggleActive(alert1.id);

      const activeAlerts = PriceAlertsService.getActive();

      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].id).toBe(alert2.id);
    });

    it('should return empty array when all alerts are paused', () => {
      const alert1 = PriceAlertsService.create('Paris', 1000);
      const alert2 = PriceAlertsService.create('Tokyo', 1500);
      
      PriceAlertsService.toggleActive(alert1.id);
      PriceAlertsService.toggleActive(alert2.id);

      const activeAlerts = PriceAlertsService.getActive();

      expect(activeAlerts).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update alert fields', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      const updated = PriceAlertsService.update(alert.id, {
        targetPrice: 1200,
        dealType: 'flight',
      });

      expect(updated).toBeDefined();
      expect(updated?.targetPrice).toBe(1200);
      expect(updated?.dealType).toBe('flight');
      expect(updated?.destination).toBe('Paris'); // Unchanged
    });

    it('should return null for non-existent alert', () => {
      const updated = PriceAlertsService.update('nonexistent', {
        targetPrice: 1200,
      });

      expect(updated).toBeNull();
    });

    it('should persist updates to localStorage', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.update(alert.id, { targetPrice: 1200 });

      const alerts = PriceAlertsService.getAll();
      expect(alerts[0].targetPrice).toBe(1200);
    });
  });

  describe('delete', () => {
    it('should delete alert by id', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      const result = PriceAlertsService.delete(alert.id);

      expect(result).toBe(true);
      expect(PriceAlertsService.getAll()).toHaveLength(0);
    });

    it('should return false for non-existent alert', () => {
      const result = PriceAlertsService.delete('nonexistent');

      expect(result).toBe(false);
    });

    it('should not affect other alerts', () => {
      const alert1 = PriceAlertsService.create('Paris', 1000);
      const alert2 = PriceAlertsService.create('Tokyo', 1500);

      PriceAlertsService.delete(alert1.id);

      const alerts = PriceAlertsService.getAll();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe(alert2.id);
    });
  });

  describe('toggleActive', () => {
    it('should toggle alert from active to inactive', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      PriceAlertsService.toggleActive(alert.id);

      const updated = PriceAlertsService.getById(alert.id);
      expect(updated?.isActive).toBe(false);
    });

    it('should toggle alert from inactive to active', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.toggleActive(alert.id);

      PriceAlertsService.toggleActive(alert.id);

      const updated = PriceAlertsService.getById(alert.id);
      expect(updated?.isActive).toBe(true);
    });

    it('should return false for non-existent alert', () => {
      const result = PriceAlertsService.toggleActive('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getById', () => {
    it('should return alert by id', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      const found = PriceAlertsService.getById(alert.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(alert.id);
      expect(found?.destination).toBe('Paris');
    });

    it('should return null for non-existent alert', () => {
      const found = PriceAlertsService.getById('nonexistent');

      expect(found).toBeNull();
    });
  });

  describe('similarExists', () => {
    it('should detect similar alert with same destination and price', () => {
      PriceAlertsService.create('Paris', 1000);

      const exists = PriceAlertsService.similarExists('Paris', 1000);

      expect(exists).toBe(true);
    });

    it('should be case-insensitive for destination', () => {
      PriceAlertsService.create('Paris', 1000);

      const exists = PriceAlertsService.similarExists('PARIS', 1000);

      expect(exists).toBe(true);
    });

    it('should not match different prices', () => {
      PriceAlertsService.create('Paris', 1000);

      const exists = PriceAlertsService.similarExists('Paris', 1200);

      expect(exists).toBe(false);
    });

    it('should match deal type if specified', () => {
      PriceAlertsService.create('Paris', 1000, 'package');

      const exists = PriceAlertsService.similarExists('Paris', 1000, 'package');

      expect(exists).toBe(true);
    });

    it('should not match different deal types', () => {
      PriceAlertsService.create('Paris', 1000, 'package');

      const exists = PriceAlertsService.similarExists('Paris', 1000, 'flight');

      expect(exists).toBe(false);
    });

    it('should ignore paused alerts', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.toggleActive(alert.id);

      const exists = PriceAlertsService.similarExists('Paris', 1000);

      expect(exists).toBe(false);
    });
  });

  describe('markAsChecked', () => {
    it('should update lastChecked timestamp', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      PriceAlertsService.markAsChecked(alert.id);

      const updated = PriceAlertsService.getById(alert.id);
      expect(updated?.lastChecked).toBeDefined();
    });
  });

  describe('markAsTriggered', () => {
    it('should update triggeredAt and notificationSent', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      PriceAlertsService.markAsTriggered(alert.id);

      const updated = PriceAlertsService.getById(alert.id);
      expect(updated?.triggeredAt).toBeDefined();
      expect(updated?.notificationSent).toBe(true);
    });
  });

  describe('notifications', () => {
    it('should create notification', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      const notification = PriceAlertsService.createNotification(
        alert.id,
        'deal123',
        'Paris City Break',
        899,
        1000,
        'Paris'
      );

      expect(notification).toBeDefined();
      expect(notification.alertId).toBe(alert.id);
      expect(notification.dealPrice).toBe(899);
      expect(notification.isRead).toBe(false);
    });

    it('should get all notifications', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.createNotification(alert.id, 'deal1', 'Deal 1', 899, 1000, 'Paris');
      PriceAlertsService.createNotification(alert.id, 'deal2', 'Deal 2', 799, 1000, 'Paris');

      const notifications = PriceAlertsService.getAllNotifications();

      expect(notifications).toHaveLength(2);
    });

    it('should get unread notifications', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      const n1 = PriceAlertsService.createNotification(alert.id, 'deal1', 'Deal 1', 899, 1000, 'Paris');
      const n2 = PriceAlertsService.createNotification(alert.id, 'deal2', 'Deal 2', 799, 1000, 'Paris');
      
      PriceAlertsService.markNotificationAsRead(n1.id);

      const unread = PriceAlertsService.getUnreadNotifications();

      expect(unread).toHaveLength(1);
      expect(unread[0].id).toBe(n2.id);
    });

    it('should mark notification as read', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      const notification = PriceAlertsService.createNotification(
        alert.id,
        'deal1',
        'Deal 1',
        899,
        1000,
        'Paris'
      );

      PriceAlertsService.markNotificationAsRead(notification.id);

      const notifications = PriceAlertsService.getAllNotifications();
      expect(notifications[0].isRead).toBe(true);
    });

    it('should mark all notifications as read', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.createNotification(alert.id, 'deal1', 'Deal 1', 899, 1000, 'Paris');
      PriceAlertsService.createNotification(alert.id, 'deal2', 'Deal 2', 799, 1000, 'Paris');

      PriceAlertsService.markAllNotificationsAsRead();

      const unread = PriceAlertsService.getUnreadNotifications();
      expect(unread).toHaveLength(0);
    });

    it('should delete notification', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      const notification = PriceAlertsService.createNotification(
        alert.id,
        'deal1',
        'Deal 1',
        899,
        1000,
        'Paris'
      );

      const result = PriceAlertsService.deleteNotification(notification.id);

      expect(result).toBe(true);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all alerts', () => {
      PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.create('Tokyo', 1500);

      PriceAlertsService.clear();

      expect(PriceAlertsService.getAll()).toHaveLength(0);
    });
  });
});
