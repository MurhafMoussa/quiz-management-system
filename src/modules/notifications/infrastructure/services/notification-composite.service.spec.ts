import { NotFoundException } from '@nestjs/common';
import { NotificationCompositeService } from './notification-composite.service';
import { NotificationChannel } from '../../domain/constants/notification-channel';
import { NotificationService } from '../../domain/interfaces/notification.service';
import { NotificationPayload } from '../../domain/interfaces/notification-payload';

describe('NotificationCompositeService', () => {
  let mockEmailService: jest.Mocked<NotificationService>;
  let mockSmsService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    mockEmailService = {
      channel: NotificationChannel.EMAIL,
      sendNotification: jest.fn().mockResolvedValue(undefined),
    };

    mockSmsService = {
      channel: NotificationChannel.SMS,
      sendNotification: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should initialize empty providers map if no services provided', async () => {
    const service = new NotificationCompositeService();
    const payload: NotificationPayload = {
      recipient: 'test@example.com',
      title: 'Test',
      message: 'Test',
    };

    await expect(
      service.send(NotificationChannel.EMAIL, payload),
    ).rejects.toThrow(NotFoundException);
  });

  it('should route notification to correct provider', async () => {
    const compositeService = new NotificationCompositeService([
      mockEmailService,
      mockSmsService,
    ]);

    const payload: NotificationPayload = {
      recipient: 'user@example.com',
      title: 'Subject',
      message: 'Body message',
    };

    await compositeService.send(NotificationChannel.EMAIL, payload);

    expect(mockEmailService.sendNotification).toHaveBeenCalledWith(payload);
    expect(mockSmsService.sendNotification).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when channel provider is missing', async () => {
    const compositeService = new NotificationCompositeService([
      mockEmailService,
    ]);

    const payload: NotificationPayload = {
      recipient: '+1234567890',
      title: 'SMS Title',
      message: 'SMS Content',
    };

    await expect(
      compositeService.send(NotificationChannel.SMS, payload),
    ).rejects.toThrow(NotFoundException);
    await expect(
      compositeService.send(NotificationChannel.SMS, payload),
    ).rejects.toThrow('Notification provider for channel [sms] not found.');
  });

  it('should ignore null/undefined service entries safely', () => {
    const compositeService = new NotificationCompositeService([
      null as any,
      undefined as any,
      mockEmailService,
    ]);

    expect(compositeService).toBeDefined();
  });
});
