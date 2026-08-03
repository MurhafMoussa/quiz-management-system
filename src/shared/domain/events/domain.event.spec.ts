import { DomainEvent } from './domain.event';

class TestDomainEvent extends DomainEvent {}

describe('DomainEvent', () => {
  it('should initialize occurredOn date upon creation', () => {
    const before = new Date();
    const event = new TestDomainEvent();
    const after = new Date();

    expect(event.occurredOn).toBeInstanceOf(Date);
    expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
