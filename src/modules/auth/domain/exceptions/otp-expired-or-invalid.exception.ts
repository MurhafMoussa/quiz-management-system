import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class OtpExpiredOrInvalidException extends DomainException {
  constructor() {
    super('auth.OTP_EXPIRED_OR_INVALID');
  }
}
