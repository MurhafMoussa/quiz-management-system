import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class TooManyOtpAttemptsException extends DomainException {
  constructor() {
    super('auth.TOO_MANY_OTP_ATTEMPTS');
  }
}
