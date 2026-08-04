import { HttpStatus } from '@nestjs/common';
import { DomainException } from 'src/shared/domain/exceptions/domain.exception';

export class ProfileAlreadyExistsException extends DomainException {
  constructor() {
    super('auth.PROFILE_ALREADY_EXISTS', {}, HttpStatus.BAD_REQUEST);
  }
}
