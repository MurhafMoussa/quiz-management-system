import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEventsNames } from 'src/shared/domain/constants/domain-events-names.enum';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';

@Injectable()
export class UserRegisteredListener {
  @OnEvent(DomainEventsNames.USER_REGISTERED)
  handle(event: UserRegisteredEvent): void {
    void event;
  }
}
