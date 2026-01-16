import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AlertCheckerService } from '../alertChecker';
import { PriceAlertsService } from '../priceAlerts';
import { TravelDeal } from '../../types/deals';

describe('AlertCheckerService', () => {
  // Sample deals for testing
  const mockDeals: TravelDeal[] = [
    {
      id: 'deal1',
      title: 'Paris City Break',
      destination: 'Paris',
      origin: 'New York',
      price: 899,
      quality_score: 85,
      deal_type: 'package',
      travel_start_date: '2026-03-01',
      travel_end_date: '2026-03-07',
      booking_url: 'https://example.com/deal1',
      image_url: 'https://example.com/paris.jpg',
      description: 'Amazing Paris deal',
    },
    {
      id: 'deal2',
      title: 'Tokyo Adventure',
      destination: 'Tokyo',
      origin: 'Los Angeles',
      price: 1299,
      quality_score: 90,
      deal_type: 'flight',
      travel_start_date: '2026-04-01',
      travel_end_date: '2026-04-10',
      booking_url: 'https://example.com/deal2',
      image_url: 'https://example.com/tokyo.jpg',
      description: 'Explore Tokyo',
    },
    {
      id: 'deal3',
      title: 'Cancun Beach Resort',
      destination: 'Cancun',
      origin: 'Miami',
      price: 799,
      quality_score: 88,
      deal_type: 'package',
      travel_start_date: '2026-05-01',
      travel_end_date: '2026-05-07',
      booking_url: 'https://example.com/deal3',
      image_url: 'https://example.com/cancun.jpg',
      description: 'Beach paradise',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('checkAlerts', () => {
    it('should create notification when deal price is below target', () => {
      PriceAlertsService.create('Paris', 1000);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(1);
      const notifications = PriceAlertsService.getAllNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].destination).toBe('Paris');
      expect(notifications[0].dealPrice).toBe(899);
    });

    it('should not create notification when deal price is above target', () => {
      PriceAlertsService.create('Tokyo', 1000);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(0);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(0);
    });

    it('should create notification when deal price equals target', () => {
      PriceAlertsService.create('Cancun', 799);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(1);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(1);
    });

    it('should check multiple alerts', () => {
      PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.create('Cancun', 1000);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(2);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(2);
    });

    it('should only check active alerts', () => {
      const alert1 = PriceAlertsService.create('Paris', 1000);
      const alert2 = PriceAlertsService.create('Cancun', 1000);
      
      PriceAlertsService.toggleActive(alert1.id); // Pause Paris alert

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(1);
      const notifications = PriceAlertsService.getAllNotifications();
      expect(notifications[0].destination).toBe('Cancun');
    });

    it('should match destination case-insensitively', () => {
      PriceAlertsService.create('PARIS', 1000);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(1);
    });

    it('should match destination with partial match', () => {
      PriceAlertsService.create('Par', 1000);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(1);
      const notifications = PriceAlertsService.getAllNotifications();
      expect(notifications[0].destination).toBe('Paris');
    });

    it('should filter by deal type if specified', () => {
      PriceAlertsService.create('Paris', 1000, 'flight');

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(0); // Paris deal is 'package', not 'flight'
    });

    it('should match any deal type if not specified', () => {
      PriceAlertsService.create('Paris', 1000); // No deal type specified

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(1);
    });

    it('should mark alert as checked', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      AlertCheckerService.checkAlerts(mockDeals);

      const updated = PriceAlertsService.getById(alert.id);
      expect(updated?.lastChecked).toBeDefined();
    });

    it('should mark alert as triggered when notification created', () => {
      const alert = PriceAlertsService.create('Paris', 1000);

      AlertCheckerService.checkAlerts(mockDeals);

      const updated = PriceAlertsService.getById(alert.id);
      expect(updated?.triggeredAt).toBeDefined();
      expect(updated?.notificationSent).toBe(true);
    });

    it('should only create one notification per alert per check', () => {
      PriceAlertsService.create('Paris', 1000);
      
      // Create multiple Paris deals
      const multipleDeals = [
        mockDeals[0], // Paris at 899
        { ...mockDeals[0], id: 'deal1b', price: 850 }, // Another Paris deal
      ];

      const count = AlertCheckerService.checkAlerts(multipleDeals);

      expect(count).toBe(1);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(1);
    });

    it('should not create duplicate notifications for already triggered alerts', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      
      // First check - should create notification
      AlertCheckerService.checkAlerts(mockDeals);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(1);

      // Second check - should not create duplicate
      const count = AlertCheckerService.checkAlerts(mockDeals);
      expect(count).toBe(0);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(1);
    });

    it('should return 0 when no alerts exist', () => {
      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(0);
    });

    it('should return 0 when no deals provided', () => {
      PriceAlertsService.create('Paris', 1000);

      const count = AlertCheckerService.checkAlerts([]);

      expect(count).toBe(0);
    });
  });

  describe('checkDealAgainstAlerts', () => {
    it('should check single deal against all alerts', () => {
      PriceAlertsService.create('Paris', 1000);

      const count = AlertCheckerService.checkDealAgainstAlerts(mockDeals[0]);

      expect(count).toBe(1);
      expect(PriceAlertsService.getAllNotifications()).toHaveLength(1);
    });

    it('should work with multiple matching alerts', () => {
      PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.create('Paris', 950);

      const count = AlertCheckerService.checkDealAgainstAlerts(mockDeals[0]);

      expect(count).toBe(2);
    });
  });

  describe('getTriggeredAlertsCount', () => {
    it('should count alerts that would be triggered', () => {
      PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.create('Cancun', 1000);
      PriceAlertsService.create('Tokyo', 1000); // Won't trigger (price too high)

      const count = AlertCheckerService.getTriggeredAlertsCount(mockDeals);

      expect(count).toBe(2);
    });

    it('should return 0 when no alerts would trigger', () => {
      PriceAlertsService.create('Paris', 500);
      PriceAlertsService.create('Tokyo', 500);

      const count = AlertCheckerService.getTriggeredAlertsCount(mockDeals);

      expect(count).toBe(0);
    });

    it('should only count active alerts', () => {
      const alert1 = PriceAlertsService.create('Paris', 1000);
      const alert2 = PriceAlertsService.create('Cancun', 1000);
      
      PriceAlertsService.toggleActive(alert1.id);

      const count = AlertCheckerService.getTriggeredAlertsCount(mockDeals);

      expect(count).toBe(1);
    });
  });

  describe('doesDealTriggerAlerts', () => {
    it('should return true when deal triggers an alert', () => {
      PriceAlertsService.create('Paris', 1000);

      const triggers = AlertCheckerService.doesDealTriggerAlerts(mockDeals[0]);

      expect(triggers).toBe(true);
    });

    it('should return false when deal does not trigger any alert', () => {
      PriceAlertsService.create('Tokyo', 1000);

      const triggers = AlertCheckerService.doesDealTriggerAlerts(mockDeals[0]);

      expect(triggers).toBe(false);
    });

    it('should return false when no alerts exist', () => {
      const triggers = AlertCheckerService.doesDealTriggerAlerts(mockDeals[0]);

      expect(triggers).toBe(false);
    });

    it('should only check active alerts', () => {
      const alert = PriceAlertsService.create('Paris', 1000);
      PriceAlertsService.toggleActive(alert.id);

      const triggers = AlertCheckerService.doesDealTriggerAlerts(mockDeals[0]);

      expect(triggers).toBe(false);
    });

    it('should respect deal type filter', () => {
      PriceAlertsService.create('Paris', 1000, 'flight');

      const triggers = AlertCheckerService.doesDealTriggerAlerts(mockDeals[0]); // package

      expect(triggers).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty destination in alert', () => {
      PriceAlertsService.create('', 1000);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      // Empty destination matches all deals, so count should be > 0
      expect(count).toBeGreaterThan(0);
    });

    it('should handle zero price threshold', () => {
      PriceAlertsService.create('Paris', 0);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(0);
    });

    it('should handle very high price threshold', () => {
      PriceAlertsService.create('Paris', 999999);

      const count = AlertCheckerService.checkAlerts(mockDeals);

      expect(count).toBe(1);
    });

    it('should handle special characters in destination', () => {
      const specialDeal = {
        ...mockDeals[0],
        destination: 'São Paulo',
      };
      
      PriceAlertsService.create('São Paulo', 1000);

      const count = AlertCheckerService.checkAlerts([specialDeal]);

      expect(count).toBe(1);
    });
  });
});
