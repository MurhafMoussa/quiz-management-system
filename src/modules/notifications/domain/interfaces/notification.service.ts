import { NotificationChannel } from '../constants/notification-channel';
import { NotificationPayload } from './notification-payload';

export abstract class NotificationService {
  abstract channel: NotificationChannel;
  abstract sendNotification(payload: NotificationPayload): Promise<void>;
}
