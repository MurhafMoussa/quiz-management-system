import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenHandler } from './refresh-token.handler';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../../domain/interfaces/user-repository';
import { HASHER_TOKEN, Hasher } from '../../domain/interfaces/hasher';
import {
  TOKEN_SERVICE_TOKEN,
  TokenService,
} from '../../domain/interfaces/token.service';
import { InvalidRefreshTokenException } from '../../infrastructure/exceptions/invalid-refresh-token.exception';
import { User } from '../../domain/entities/user.entity';
import { Role } from 'src/shared/domain/enums/role.enum';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<Hasher>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    hasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    tokenService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenHandler,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: HASHER_TOKEN, useValue: hasher },
        { provide: TOKEN_SERVICE_TOKEN, useValue: tokenService },
      ],
    }).compile();

    handler = module.get<RefreshTokenHandler>(RefreshTokenHandler);
  });

  it('should successfully refresh access token with valid refresh token', async () => {
    const oldRefreshToken = 'valid-refresh-token';
    const payload = {
      userId: 'user-id-1',
      email: 'john@example.com',
      role: Role.STUDENT,
    };
    const mockUser = User.rehydrate({
      id: 'user-id-1',
      firstName: 'john',
      lastName: 'doe',
      email: 'john@example.com',
      passwordHash: 'hash',
      refreshTokenHash: 'stored-hashed-refresh',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    tokenService.verifyRefreshToken.mockResolvedValue(payload);
    userRepository.findById.mockResolvedValue(mockUser);
    hasher.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    hasher.hash.mockResolvedValue('new-hashed-refresh');

    const result = await handler.handle(oldRefreshToken);

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(
      oldRefreshToken,
    );
    expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
    expect(hasher.compare).toHaveBeenCalledWith(
      oldRefreshToken,
      'stored-hashed-refresh',
    );
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockUser.refreshTokenHash).toBe('new-hashed-refresh');
    expect(result).toEqual({
      refreshToken: 'new-refresh-token',
      accessToken: 'new-access-token',
      user: {
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        isVerified: mockUser.isVerified,
        role: mockUser.role,
        profile: null,
      },
    });
  });

  it('should throw InvalidRefreshTokenException if user or user.refreshTokenHash is missing', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      userId: 'u-1',
      email: 'a@b.com',
      role: Role.STUDENT,
    });
    userRepository.findById.mockResolvedValue(null);

    await expect(handler.handle('some-token')).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });

  it('should throw InvalidRefreshTokenException if refresh tokens do not match', async () => {
    const mockUser = User.rehydrate({
      id: 'u-1',
      firstName: 'john',
      lastName: 'doe',
      email: 'john@example.com',
      passwordHash: 'hash',
      refreshTokenHash: 'stored-hashed-refresh',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    tokenService.verifyRefreshToken.mockResolvedValue({
      userId: 'u-1',
      email: 'john@example.com',
      role: Role.STUDENT,
    });
    userRepository.findById.mockResolvedValue(mockUser);
    hasher.compare.mockResolvedValue(false);

    await expect(handler.handle('wrong-token')).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });
});
