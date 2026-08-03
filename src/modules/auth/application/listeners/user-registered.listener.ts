import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEventsNames } from 'src/shared/domain/constants/domain-events-names.enum';
import {
  RANDOM_GENERATOR_TOKEN,
  type RandomGenerator,
} from 'src/shared/domain/interfaces/random-generator';
import { TimeUtils } from 'src/shared/utils/time.utils';
import { NotificationChannel } from 'src/modules/notifications/domain/constants/notification-channel';
import { NotificationCompositeService } from 'src/modules/notifications/infrastructure/services/notification-composite.service';
import {
  OTP_COOLDOWN_MINUTES,
  OTP_EXPIRATION_MINUTES,
} from '../../domain/constants/otp.constants';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { HASHER_TOKEN, type Hasher } from '../../domain/interfaces/hasher';
import {
  OTP_REPOSITORY_TOKEN,
  type OtpRepository,
} from '../../domain/interfaces/otp-repository';

@Injectable()
export class UserRegisteredListener {
  constructor(
    @Inject(OTP_REPOSITORY_TOKEN) private readonly otpRepo: OtpRepository,
    @Inject(HASHER_TOKEN) private readonly hasher: Hasher,
    @Inject(RANDOM_GENERATOR_TOKEN)
    private readonly randomGenerator: RandomGenerator<string>,
    private readonly notificationService: NotificationCompositeService,
  ) {}

  @OnEvent(DomainEventsNames.USER_REGISTERED)
  async handle(event: UserRegisteredEvent): Promise<void> {
    const rawCode = this.randomGenerator.generate(6);
    const codeHash = await this.hasher.hash(rawCode);

    const ttlSeconds =
      TimeUtils.convertMinutesToMilliseconds(OTP_EXPIRATION_MINUTES) / 1000;
    const cooldownSeconds =
      TimeUtils.convertMinutesToMilliseconds(OTP_COOLDOWN_MINUTES) / 1000;

    await this.otpRepo.saveOtp(event.userId, codeHash, ttlSeconds);
    await this.otpRepo.setCooldown(event.userId, cooldownSeconds);

    await this.notificationService.send(NotificationChannel.EMAIL, {
      recipient: event.email,
      title: 'Verify Your Email',
      message: `Your verification code is: ${rawCode}`,
      data: {
        userId: event.userId,
        code: rawCode,
      },
    });
  }
}
