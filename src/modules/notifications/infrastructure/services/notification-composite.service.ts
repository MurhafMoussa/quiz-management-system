import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationChannel } from '../../domain/constants/notification-channel';
import { NotificationPayload } from '../../domain/interfaces/notification-payload';
import { NotificationService } from '../../domain/interfaces/notification.service';

@Injectable()
export class NotificationCompositeService {
  private readonly providers = new Map<
    NotificationChannel,
    NotificationService
  >();

  constructor(services: NotificationService[] = []) {
    services.forEach((service) => {
      if (service?.channel) {
        this.providers.set(service.channel, service);
      }
    });
  }

  async send(
    channel: NotificationChannel,
    payload: NotificationPayload,
  ): Promise<void> {
    const provider = this.providers.get(channel);

    if (!provider) {
      throw new NotFoundException(
        `Notification provider for channel [${channel}] not found.`,
      );
    }

    await provider.sendNotification(payload);
  }
}
