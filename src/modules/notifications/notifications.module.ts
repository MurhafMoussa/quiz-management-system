import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.validation';
import { EmailNotificationProvider } from './infrastructure/providers/email-notification.provider';
import { NotificationCompositeService } from './infrastructure/services/notification-composite.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        transport: {
          host: configService.get('SMTP_HOST', { infer: true }),
          port: configService.get('SMTP_PORT', { infer: true }),
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: configService.get('FROM', { infer: true }),
        },
      }),
    }),
  ],
  providers: [
    EmailNotificationProvider,
    {
      provide: NotificationCompositeService,
      useFactory: (email: EmailNotificationProvider) => {
        return new NotificationCompositeService([email]);
      },
      inject: [EmailNotificationProvider],
    },
  ],
  exports: [NotificationCompositeService, EmailNotificationProvider],
})
export class NotificationsModule {}
