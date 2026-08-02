import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class InvalidOtpCodeException extends DomainException {
  constructor(public readonly remainingAttempts: number) {
    super('auth.INVALID_OTP_CODE');
  }
}
