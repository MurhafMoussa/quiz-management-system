import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationChannel } from 'src/modules/notifications/domain/constants/notification-channel';
import { NotificationCompositeService } from 'src/modules/notifications/infrastructure/services/notification-composite.service';
import { DomainEventsNames } from 'src/shared/domain/constants/domain-events-names.enum';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';

@Injectable()
export class UserRegisteredListener {
  constructor(
    private readonly notificationService: NotificationCompositeService,
  ) {}

  @OnEvent(DomainEventsNames.USER_REGISTERED)
  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.notificationService.send(NotificationChannel.EMAIL, {
      recipient: event.email,
      title: 'Welcome to Quiz Management System',
      message: `Hello ${event.username}, welcome to Quiz Management System!`,
      data: {
        userId: event.userId,
        username: event.username,
      },
    });
  }
}
