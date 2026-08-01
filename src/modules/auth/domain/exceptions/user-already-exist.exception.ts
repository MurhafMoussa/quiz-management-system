import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class UserAlreadyExistException extends DomainException {
  constructor(private readonly email: string) {
    super('auth.EMAIL_ALREADY_EXISTS', { email });
  }
}
