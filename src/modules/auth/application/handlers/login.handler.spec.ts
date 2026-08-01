import { Test, TestingModule } from '@nestjs/testing';
import { LoginHandler } from './login.handler';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../../domain/interfaces/user-repository';
import { HASHER_TOKEN, Hasher } from '../../domain/interfaces/hasher';
import {
  TOKEN_SERVICE_TOKEN,
  TokenService,
} from '../../domain/interfaces/token.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { User } from '../../domain/entities/user.entity';

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<Hasher>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
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
        LoginHandler,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: HASHER_TOKEN, useValue: hasher },
        { provide: TOKEN_SERVICE_TOKEN, useValue: tokenService },
      ],
    }).compile();

    handler = module.get<LoginHandler>(LoginHandler);
  });

  it('should successfully login existing user with correct credentials', async () => {
    const loginDto = { email: 'john@example.com', password: 'password123' };
    const mockUser = User.rehydrate({
      id: 'user-id-1',
      username: 'john',
      email: 'john@example.com',
      passwordHash: 'hashedPass',
      refreshTokenHash: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.findByEmail.mockResolvedValue(mockUser);
    hasher.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue({
      accessToken: 'acc-token',
      refreshToken: 'ref-token',
    });
    hasher.hash.mockResolvedValue('hashed-ref-token');

    const result = await handler.handle(loginDto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(hasher.compare).toHaveBeenCalledWith('password123', 'hashedPass');
    expect(tokenService.generateTokens).toHaveBeenCalledWith({
      email: mockUser.email,
      userId: mockUser.id,
    });
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockUser.refreshTokenHash).toBe('hashed-ref-token');
    expect(result).toEqual({
      accessToken: 'acc-token',
      refreshToken: 'ref-token',
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      },
    });
  });

  it('should throw InvalidCredentialsException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      handler.handle({ email: 'nonexistent@example.com', password: 'pass' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password does not match', async () => {
    const mockUser = User.rehydrate({
      id: 'user-id-1',
      username: 'john',
      email: 'john@example.com',
      passwordHash: 'hashedPass',
      refreshTokenHash: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.findByEmail.mockResolvedValue(mockUser);
    hasher.compare.mockResolvedValue(false);

    await expect(
      handler.handle({ email: 'john@example.com', password: 'wrongPassword' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
