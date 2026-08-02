import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '../../domain/constants/notification-channel';
import { NotificationPayload } from '../../domain/interfaces/notification-payload';
import { NotificationService } from '../../domain/interfaces/notification.service';

@Injectable()
export class EmailNotificationProvider implements NotificationService {
  channel: NotificationChannel = NotificationChannel.EMAIL;

  constructor(private readonly mailerService: MailerService) {}

  async sendNotification(payload: NotificationPayload): Promise<void> {
    const { recipient, title, message, data } = payload;
    const mailOptions: ISendMailOptions = {
      to: recipient,
      subject: title,
      text: message,
      ...(data ?? {}),
    };

    if (typeof data?.html === 'string') {
      mailOptions.html = data.html;
    }

    await this.mailerService.sendMail(mailOptions);
  }
}
