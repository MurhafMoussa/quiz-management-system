import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { MAX_OTP_ATTEMPTS } from '../../domain/constants/otp.constants';
import { InvalidOtpCodeException } from '../../domain/exceptions/invalid-otp-code.exception';
import { OtpExpiredOrInvalidException } from '../../domain/exceptions/otp-expired-or-invalid.exception';
import { TooManyOtpAttemptsException } from '../../domain/exceptions/too-many-otp-attempts.exception';
import { HASHER_TOKEN, type Hasher } from '../../domain/interfaces/hasher';
import {
  OTP_REPOSITORY_TOKEN,
  type OtpRepository,
} from '../../domain/interfaces/otp-repository';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from '../../domain/interfaces/user-repository';

@Injectable()
export class VerifyEmailHandler {
  constructor(
    @Inject(OTP_REPOSITORY_TOKEN) private readonly otpRepo: OtpRepository,
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: UserRepository,
    @Inject(HASHER_TOKEN) private readonly hasher: Hasher,
  ) {}

  async execute(userId: string, inputCode: string): Promise<void> {
    const otpData = await this.otpRepo.getOtp(userId);
    if (!otpData) {
      throw new OtpExpiredOrInvalidException();
    }

    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
      await this.otpRepo.deleteOtp(userId);
      throw new TooManyOtpAttemptsException();
    }

    const isValid = await this.hasher.compare(inputCode, otpData.codeHash);

    if (!isValid) {
      const attempts = await this.otpRepo.incrementAttempts(userId);
      if (attempts >= MAX_OTP_ATTEMPTS) {
        await this.otpRepo.deleteOtp(userId);
        throw new TooManyOtpAttemptsException();
      }
      const remaining = MAX_OTP_ATTEMPTS - attempts;
      throw new InvalidOtpCodeException(remaining);
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundDomainException({ resourceName: 'User' });
    }

    user.markAsVerified();
    await this.userRepo.save(user);

    await this.otpRepo.deleteOtp(userId);
  }
}
