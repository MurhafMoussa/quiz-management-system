import { Test, TestingModule } from '@nestjs/testing';
import { UserRegisteredListener } from './user-registered.listener';
import { NotificationCompositeService } from 'src/modules/notifications/infrastructure/services/notification-composite.service';
import { NotificationChannel } from 'src/modules/notifications/domain/constants/notification-channel';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';

describe('UserRegisteredListener', () => {
  let listener: UserRegisteredListener;
  let notificationServiceMock: jest.Mocked<NotificationCompositeService>;

  beforeEach(async () => {
    notificationServiceMock = {
      send: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRegisteredListener,
        {
          provide: NotificationCompositeService,
          useValue: notificationServiceMock,
        },
      ],
    }).compile();

    listener = module.get<UserRegisteredListener>(UserRegisteredListener);
  });

  it('should send welcome notification email when UserRegisteredEvent is handled', async () => {
    const event = new UserRegisteredEvent(
      'user-123',
      'johndoe',
      'john@example.com',
    );

    await listener.handle(event);

    expect(notificationServiceMock.send).toHaveBeenCalledWith(
      NotificationChannel.EMAIL,
      {
        recipient: 'john@example.com',
        title: 'Welcome to Quiz Management System',
        message: 'Hello johndoe, welcome to Quiz Management System!',
        data: {
          userId: 'user-123',
          username: 'johndoe',
        },
      },
    );
  });
});
