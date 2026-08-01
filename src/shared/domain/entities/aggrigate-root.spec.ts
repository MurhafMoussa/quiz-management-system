import { AggregateRoot } from './aggrigate-root';
import { DomainEvent } from '../events/domain.event';

class DummyEvent extends DomainEvent {
  constructor(public readonly name: string) {
    super();
  }
}

class TestAggregate extends AggregateRoot {
  public addTestEvent(name: string): void {
    this.recordDomainEvent(new DummyEvent(name));
  }
}

describe('AggregateRoot', () => {
  it('should record domain events and allow reading via domainEvents getter', () => {
    const aggregate = new TestAggregate();
    expect(aggregate.domainEvents).toHaveLength(0);

    aggregate.addTestEvent('first');
    expect(aggregate.domainEvents).toHaveLength(1);
    expect(aggregate.domainEvents[0]).toBeInstanceOf(DummyEvent);
    expect((aggregate.domainEvents[0] as DummyEvent).name).toBe('first');
  });

  it('should pull domain events and clear internal events buffer', () => {
    const aggregate = new TestAggregate();
    aggregate.addTestEvent('event-1');
    aggregate.addTestEvent('event-2');

    expect(aggregate.domainEvents).toHaveLength(2);

    const pulledEvents = aggregate.pullDomainEvents();
    expect(pulledEvents).toHaveLength(2);
    expect((pulledEvents[0] as DummyEvent).name).toBe('event-1');
    expect((pulledEvents[1] as DummyEvent).name).toBe('event-2');

    expect(aggregate.domainEvents).toHaveLength(0);
    expect(aggregate.pullDomainEvents()).toHaveLength(0);
  });
});
