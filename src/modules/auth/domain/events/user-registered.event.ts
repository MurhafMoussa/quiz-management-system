import { DomainEvent } from 'src/shared/domain/events/domain.event';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly email: string,
  ) {
    super();
  }
}
