import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class NotFoundDomainException extends DomainException {
  constructor(args?: Record<string, any>) {
    super('common.NOT_FOUND', args, HttpStatus.NOT_FOUND);
  }
}
