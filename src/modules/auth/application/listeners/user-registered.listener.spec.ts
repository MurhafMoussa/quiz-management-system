import { Test, TestingModule } from '@nestjs/testing';
import { NotificationChannel } from 'src/modules/notifications/domain/constants/notification-channel';
import { NotificationCompositeService } from 'src/modules/notifications/infrastructure/services/notification-composite.service';
import { RANDOM_GENERATOR_TOKEN } from 'src/shared/domain/interfaces/random-generator';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { HASHER_TOKEN } from '../../domain/interfaces/hasher';
import { OTP_REPOSITORY_TOKEN } from '../../domain/interfaces/otp-repository';
import { UserRegisteredListener } from './user-registered.listener';

describe('UserRegisteredListener', () => {
  let listener: UserRegisteredListener;
  let otpRepoMock: any;
  let hasherMock: any;
  let randomGeneratorMock: any;
  let notificationServiceMock: jest.Mocked<NotificationCompositeService>;

  beforeEach(async () => {
    otpRepoMock = {
      saveOtp: jest.fn().mockResolvedValue(undefined),
      setCooldown: jest.fn().mockResolvedValue(undefined),
    };

    hasherMock = {
      hash: jest.fn().mockResolvedValue('hashed_otp_123456'),
    };

    randomGeneratorMock = {
      generate: jest.fn().mockReturnValue('123456'),
    };

    notificationServiceMock = {
      send: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRegisteredListener,
        {
          provide: OTP_REPOSITORY_TOKEN,
          useValue: otpRepoMock,
        },
        {
          provide: HASHER_TOKEN,
          useValue: hasherMock,
        },
        {
          provide: RANDOM_GENERATOR_TOKEN,
          useValue: randomGeneratorMock,
        },
        {
          provide: NotificationCompositeService,
          useValue: notificationServiceMock,
        },
      ],
    }).compile();

    listener = module.get<UserRegisteredListener>(UserRegisteredListener);
  });

  it('should generate OTP, hash it, store in Redis with TTLs, and send email notification', async () => {
    const event = new UserRegisteredEvent(
      'user-123',
      'johndoe',
      'john@example.com',
    );

    await listener.handle(event);

    expect(randomGeneratorMock.generate).toHaveBeenCalledWith(6);
    expect(hasherMock.hash).toHaveBeenCalledWith('123456');

    // 15 minutes = 900 seconds, 1 minute cooldown = 60 seconds
    expect(otpRepoMock.saveOtp).toHaveBeenCalledWith(
      'user-123',
      'hashed_otp_123456',
      900,
    );
    expect(otpRepoMock.setCooldown).toHaveBeenCalledWith('user-123', 60);

    expect(notificationServiceMock.send).toHaveBeenCalledWith(
      NotificationChannel.EMAIL,
      {
        recipient: 'john@example.com',
        title: 'Verify Your Email',
        message: 'Your verification code is: 123456',
        data: {
          userId: 'user-123',
          code: '123456',
        },
      },
    );
  });
});
