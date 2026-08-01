import { User } from './user.entity';

describe('User Domain Entity', () => {
  it('should create a new user entity using create()', () => {
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
  });

  it('should rehydrate an existing user entity using rehydrate()', () => {
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
