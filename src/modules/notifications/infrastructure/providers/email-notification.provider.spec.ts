import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailNotificationProvider } from './email-notification.provider';
import { NotificationChannel } from '../../domain/constants/notification-channel';
import { NotificationPayload } from '../../domain/interfaces/notification-payload';

describe('EmailNotificationProvider', () => {
  let provider: EmailNotificationProvider;
  let mailerService: jest.Mocked<MailerService>;

  beforeEach(async () => {
    mailerService = {
      sendMail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailNotificationProvider,
        {
          provide: MailerService,
          useValue: mailerService,
        },
      ],
    }).compile();

    provider = module.get<EmailNotificationProvider>(EmailNotificationProvider);
  });

  it('should have channel set to NotificationChannel.EMAIL', () => {
    expect(provider.channel).toBe(NotificationChannel.EMAIL);
  });

  it('should send plain text email successfully', async () => {
    mailerService.sendMail.mockResolvedValue(true);

    const payload: NotificationPayload = {
      recipient: 'user@example.com',
      title: 'Welcome',
      message: 'Welcome to our platform',
    };

    await provider.sendNotification(payload);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome',
      text: 'Welcome to our platform',
    });
  });

  it('should include html and extra data options if provided in payload', async () => {
    mailerService.sendMail.mockResolvedValue(true);

    const payload: NotificationPayload = {
      recipient: 'user@example.com',
      title: 'HTML Email',
      message: 'Text fallback',
      data: {
        html: '<p>HTML Content</p>',
        customHeader: 'CustomValue',
      },
    };

    await provider.sendNotification(payload);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'HTML Email',
      text: 'Text fallback',
      html: '<p>HTML Content</p>',
      customHeader: 'CustomValue',
    });
  });

  it('should rethrow error if mailerService throws', async () => {
    mailerService.sendMail.mockRejectedValue(new Error('SMTP error'));

    const payload: NotificationPayload = {
      recipient: 'user@example.com',
      title: 'Test',
      message: 'Test message',
    };

    await expect(provider.sendNotification(payload)).rejects.toThrow(
      'SMTP error',
    );
  });
});
