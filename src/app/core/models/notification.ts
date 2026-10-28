export type NotificationType = 'Email' | 'SMS' | 'InApp';

export type NotificationEvent =
  | 'BookingConfirmation'
  | 'PaymentConfirmation'
  | 'PickupReminder'
  | 'ReturnReminder'
  | 'Cancellation'
  | 'ReviewRequest'
  | 'ComplaintResponse'
  | 'DriverRegistration';

export interface AppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  event: NotificationEvent;
  isRead: boolean;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CreateNotification {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  event: NotificationEvent;
}

export interface TriggerNotification {
  userId: number;
  toEmail?: string;
  toPhone?: string;
  event: NotificationEvent;
  customMessage?: string;
  actionUrl?: string;
  actionLabel?: string;
}
