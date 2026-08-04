import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class AlreadyExistDomainException extends DomainException {
  constructor(args?: Record<string, any>) {
    super('common.ALREADY_EXISTS', args, HttpStatus.BAD_REQUEST);
  }
}
