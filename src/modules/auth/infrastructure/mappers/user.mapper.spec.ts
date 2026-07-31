import { UserMapper } from './user.mapper';
import { User } from '../../domain/entities/user.entity';
import { User as PrismaUser } from 'src/generated/prisma/client';

describe('UserMapper', () => {
  const date = new Date('2025-01-01T00:00:00.000Z');

  const rawPrismaUser: PrismaUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashedPassword',
    refresh_token_hash: 'hashedRefreshToken',
    created_at: date,
    updated_at: date,
  };

  it('should map Prisma user model to domain User entity (toDomain)', () => {
    const domainUser = UserMapper.toDomain(rawPrismaUser);

    expect(domainUser).toBeInstanceOf(User);
    expect(domainUser.id).toBe(rawPrismaUser.id);
    expect(domainUser.username).toBe(rawPrismaUser.username);
    expect(domainUser.email).toBe(rawPrismaUser.email);
    expect(domainUser.passwordHash).toBe(rawPrismaUser.password_hash);
    expect(domainUser.refreshTokenHash).toBe(rawPrismaUser.refresh_token_hash);
    expect(domainUser.createdAt).toEqual(rawPrismaUser.created_at);
    expect(domainUser.updatedAt).toEqual(rawPrismaUser.updated_at);
  });

  it('should handle undefined refresh_token_hash in toDomain', () => {
    const rawUserNoRefresh: PrismaUser = {
      ...rawPrismaUser,
      refresh_token_hash: null,
    };

    const domainUser = UserMapper.toDomain(rawUserNoRefresh);
    expect(domainUser.refreshTokenHash).toBeUndefined();
  });

  it('should map domain User entity to Prisma persistence object (toPersistence)', () => {
    const domainUser = User.rehydrate({
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      refreshTokenHash: 'hashedRefreshToken',
      createdAt: date,
      updatedAt: date,
    });

    const persistence = UserMapper.toPersistence(domainUser);

    expect(persistence).toEqual({
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedPassword',
      refresh_token_hash: 'hashedRefreshToken',
      created_at: date,
      updated_at: date,
    });
  });
});
