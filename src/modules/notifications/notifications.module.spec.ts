import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationsModule } from './notifications.module';
import { NotificationCompositeService } from './infrastructure/services/notification-composite.service';
import { EmailNotificationProvider } from './infrastructure/providers/email-notification.provider';
import { NotificationChannel } from './domain/constants/notification-channel';

describe('NotificationsModule', () => {
  let moduleRef: TestingModule;
  let compositeService: NotificationCompositeService;
  let mailerServiceMock: jest.Mocked<MailerService>;

  beforeEach(async () => {
    mailerServiceMock = {
      sendMail: jest.fn().mockResolvedValue(true),
    } as any;

    moduleRef = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          const config: Record<string, any> = {
            SMTP_HOST: 'smtp.test.com',
            SMTP_PORT: 587,
            FROM: 'test@yourapp.com',
          };
          return config[key];
        }),
      })
      .overrideProvider(MailerService)
      .useValue(mailerServiceMock)
      .compile();

    compositeService = moduleRef.get<NotificationCompositeService>(
      NotificationCompositeService,
    );
  });

  it('should compile the module and resolve services', () => {
    expect(compositeService).toBeDefined();
    expect(moduleRef.get(EmailNotificationProvider)).toBeDefined();
  });

  it('should send notification through NotificationCompositeService', async () => {
    await compositeService.send(NotificationChannel.EMAIL, {
      recipient: 'target@example.com',
      title: 'Test Email',
      message: 'Hello World',
    });

    expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
      to: 'target@example.com',
      subject: 'Test Email',
      text: 'Hello World',
    });
  });
});
