export interface NotificationPayload {
  title: string;
  message: string;
  recipient: string;
  data?: Record<string, any>;
}
