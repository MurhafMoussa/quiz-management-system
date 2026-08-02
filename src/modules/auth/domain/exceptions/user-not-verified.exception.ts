import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class UserNotVerifiedException extends DomainException {
  constructor() {
    super('auth.USER_NOT_VERIFIED');
  }
}
