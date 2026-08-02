import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class UserNotFoundException extends DomainException {
  constructor() {
    super('auth.USER_NOT_FOUND');
  }
}
