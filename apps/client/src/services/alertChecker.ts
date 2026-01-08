import { TravelDeal } from '../types/deals';
import { PriceAlert } from '../types/alerts';
import { PriceAlertsService } from './priceAlerts';

/**
 * Service for checking deals against price alerts
 * and creating notifications when alerts are triggered
 */
export class AlertCheckerService {
  /**
   * Check all active alerts against current deals
   * Returns number of new notifications created
   */
  static checkAlerts(deals: TravelDeal[]): number {
    const activeAlerts = PriceAlertsService.getActive();
    let notificationsCreated = 0;

    for (const alert of activeAlerts) {
      const matchingDeals = this.findMatchingDeals(deals, alert);
      
      for (const deal of matchingDeals) {
        // Check if deal price is at or below target
        if (deal.price <= alert.targetPrice) {
          // Check if we haven't already notified for this alert recently
          if (!alert.triggeredAt || this.shouldNotifyAgain(alert.triggeredAt)) {
            // Create notification
            PriceAlertsService.createNotification(
              alert.id,
              deal.id,
              deal.title,
              deal.price,
              alert.targetPrice,
              deal.destination
            );
            
            // Mark alert as triggered
            PriceAlertsService.markAsTriggered(alert.id);
            
            notificationsCreated++;
            
            // Only create one notification per alert per check
            break;
          }
        }
      }
      
      // Mark alert as checked
      PriceAlertsService.markAsChecked(alert.id);
    }

    return notificationsCreated;
  }

  /**
   * Find deals that match an alert's criteria
   */
  private static findMatchingDeals(deals: TravelDeal[], alert: PriceAlert): TravelDeal[] {
    return deals.filter(deal => {
      // Check destination match (case-insensitive, partial match)
      const destinationMatch = deal.destination
        .toLowerCase()
        .includes(alert.destination.toLowerCase());
      
      if (!destinationMatch) return false;
      
      // Check deal type if specified
      if (alert.dealType && alert.dealType !== '') {
        const dealTypeMatch = deal.deal_type === alert.dealType;
        if (!dealTypeMatch) return false;
      }
      
      return true;
    });
  }

  /**
   * Determine if we should notify again for a triggered alert
   * Currently: notify once per day
   */
  private static shouldNotifyAgain(lastTriggeredAt: string): boolean {
    const lastTriggered = new Date(lastTriggeredAt);
    const now = new Date();
    const hoursSinceLastTrigger = (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60);
    
    // Notify again if more than 24 hours have passed
    return hoursSinceLastTrigger >= 24;
  }

  /**
   * Check a single deal against all active alerts
   * Useful for real-time checking when new deals are added
   */
  static checkDealAgainstAlerts(deal: TravelDeal): number {
    return this.checkAlerts([deal]);
  }

  /**
   * Get count of alerts that would be triggered by current deals
   */
  static getTriggeredAlertsCount(deals: TravelDeal[]): number {
    const activeAlerts = PriceAlertsService.getActive();
    let count = 0;

    for (const alert of activeAlerts) {
      const matchingDeals = this.findMatchingDeals(deals, alert);
      const hasMatchingDeal = matchingDeals.some(deal => deal.price <= alert.targetPrice);
      
      if (hasMatchingDeal) {
        count++;
      }
    }

    return count;
  }

  /**
   * Check if a specific deal triggers any alerts
   */
  static doesDealTriggerAlerts(deal: TravelDeal): boolean {
    const activeAlerts = PriceAlertsService.getActive();
    
    for (const alert of activeAlerts) {
      const matchingDeals = this.findMatchingDeals([deal], alert);
      if (matchingDeals.length > 0 && deal.price <= alert.targetPrice) {
        return true;
      }
    }
    
    return false;
  }
}
