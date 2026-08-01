import { User } from './user.entity';
import { UserRegisteredEvent } from '../events/user-registered.event';

describe('User Domain Entity', () => {
  it('should create a new user entity using create() and record UserRegisteredEvent', () => {
    const params = {
      id: 'id-1',
      username: 'john',
      email: 'john@example.com',
      passwordHash: 'hash123',
      refreshTokenHash: undefined,
    };

    const user = User.create(params);

    expect(user.id).toBe(params.id);
    expect(user.username).toBe(params.username);
    expect(user.email).toBe(params.email);
    expect(user.passwordHash).toBe(params.passwordHash);
    expect(user.refreshTokenHash).toBeUndefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);

    expect(user.domainEvents).toHaveLength(1);
    const event = user.domainEvents[0] as UserRegisteredEvent;
    expect(event).toBeInstanceOf(UserRegisteredEvent);
    expect(event.userId).toBe('id-1');
    expect(event.username).toBe('john');
    expect(event.email).toBe('john@example.com');
  });

  it('should rehydrate an existing user entity using rehydrate() without recording domain events', () => {
    const createdAt = new Date('2024-01-01');
    const updatedAt = new Date('2024-01-02');

    const user = User.rehydrate({
      id: 'id-1',
      username: 'john',
      email: 'john@example.com',
      passwordHash: 'hash123',
      refreshTokenHash: 'refresh123',
      createdAt,
      updatedAt,
    });

    expect(user.id).toBe('id-1');
    expect(user.createdAt).toEqual(createdAt);
    expect(user.updatedAt).toEqual(updatedAt);
    expect(user.refreshTokenHash).toBe('refresh123');
    expect(user.domainEvents).toHaveLength(0);
  });

  it('should update username, password, refresh token and touch updatedAt', () => {
    const initialDate = new Date('2024-01-01');
    const user = User.rehydrate({
      id: 'id-1',
      username: 'oldname',
      email: 'john@example.com',
      passwordHash: 'oldhash',
      refreshTokenHash: 'oldrefresh',
      createdAt: initialDate,
      updatedAt: initialDate,
    });

    user.changeUsername('newname');
    expect(user.username).toBe('newname');
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
      initialDate.getTime(),
    );

    user.changePassword('newhash');
    expect(user.passwordHash).toBe('newhash');

    user.changeRefreshToken('newrefresh');
    expect(user.refreshTokenHash).toBe('newrefresh');

    user.clearRefreshToken();
    expect(user.refreshTokenHash).toBeUndefined();
  });
});
