// Notification types

export type NotificationType = 'info' | 'warning' | 'success' | 'device' | 'critical_alert' | 'pest_alert';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;    // Display-ready relative or absolute time
  type: NotificationType;
  read: boolean;
}
