export interface PriceAlert {
  id: string;
  destination: string;
  targetPrice: number;
  dealType?: string;
  isActive: boolean;
  createdAt: string;
  lastChecked?: string;
  triggeredAt?: string;
  notificationSent?: boolean;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  dealId: string;
  dealTitle: string;
  dealPrice: number;
  targetPrice: number;
  destination: string;
  createdAt: string;
  isRead: boolean;
}

export const ALERT_STATUS = {
  ACTIVE: 'active',
  TRIGGERED: 'triggered',
  INACTIVE: 'inactive',
} as const;

export type AlertStatus = typeof ALERT_STATUS[keyof typeof ALERT_STATUS];
