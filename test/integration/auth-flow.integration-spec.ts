import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { RegisterHandler } from '../../src/modules/auth/application/handlers/register.handler';
import { LoginHandler } from '../../src/modules/auth/application/handlers/login.handler';
import { RefreshTokenHandler } from '../../src/modules/auth/application/handlers/refresh-token.handler';
import { GetCurrentUserHandler } from '../../src/modules/auth/application/handlers/get-current-user.handler';

import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../../src/modules/auth/domain/interfaces/user-repository';
import { HASHER_TOKEN } from '../../src/modules/auth/domain/interfaces/hasher';
import { TOKEN_SERVICE_TOKEN } from '../../src/modules/auth/domain/interfaces/token.service';
import { ID_GENERATOR_TOKEN } from '../../src/shared/domain/interfaces/id-generator';

import { ArgonPasswordHasher } from '../../src/modules/auth/infrastructure/services/argon-string-hasher';
import { JwtTokenService } from '../../src/modules/auth/infrastructure/services/jwt.service';
import { UuidV7Generator } from '../../src/shared/infrastructure/services/uuid-v7-generator';
import { User } from '../../src/modules/auth/domain/entities/user.entity';

import { UserAlreadyExistException } from '../../src/modules/auth/domain/exceptions/user-already-exist.exception';
import { InvalidCredentialsException } from '../../src/modules/auth/domain/exceptions/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../../src/modules/auth/infrastructure/exceptions/invalid-refresh-token.exception';

describe('Auth Flow Integration (Handlers + Security Services)', () => {
  let registerHandler: RegisterHandler;
  let loginHandler: LoginHandler;
  let refreshTokenHandler: RefreshTokenHandler;
  let getCurrentUserHandler: GetCurrentUserHandler;

  const inMemoryUsers = new Map<string, User>();

  const inMemoryRepository: UserRepository = {
    async findByEmail(email: string): Promise<User | null> {
      for (const user of inMemoryUsers.values()) {
        if (user.email === email) return user;
      }
      return null;
    },
    async findById(id: string): Promise<User | null> {
      return inMemoryUsers.get(id) || null;
    },
    async save(user: User): Promise<User> {
      inMemoryUsers.set(user.id, user);
      return user;
    },
  };

  beforeAll(async () => {
    process.env.JWT_ACCESS_TOKEN_SECRET =
      'integration-test-access-secret-12345';
    process.env.JWT_REFRESH_TOKEN_SECRET =
      'integration-test-refresh-secret-12345';
    process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS = '3600000';
    process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS = '86400000';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({}),
      ],
      providers: [
        RegisterHandler,
        LoginHandler,
        RefreshTokenHandler,
        GetCurrentUserHandler,
        { provide: USER_REPOSITORY_TOKEN, useValue: inMemoryRepository },
        { provide: HASHER_TOKEN, useClass: ArgonPasswordHasher },
        { provide: TOKEN_SERVICE_TOKEN, useClass: JwtTokenService },
        { provide: ID_GENERATOR_TOKEN, useClass: UuidV7Generator },
      ],
    }).compile();

    registerHandler = module.get<RegisterHandler>(RegisterHandler);
    loginHandler = module.get<LoginHandler>(LoginHandler);
    refreshTokenHandler = module.get<RefreshTokenHandler>(RefreshTokenHandler);
    getCurrentUserHandler = module.get<GetCurrentUserHandler>(
      GetCurrentUserHandler,
    );
  });

  beforeEach(() => {
    inMemoryUsers.clear();
  });

  it('should execute full auth lifecycle: Register -> Login -> GetProfile -> RefreshToken', async () => {
    // 1. Register User
    const registerDto = {
      username: 'alice',
      email: 'alice@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    const registerResult = await registerHandler.handle(registerDto);
    expect(registerResult.user.username).toBe('alice');
    expect(registerResult.accessToken).toBeDefined();
    expect(registerResult.refreshToken).toBeDefined();

    // 2. Login User
    const loginResult = await loginHandler.handle({
      email: 'alice@example.com',
      password: 'SecurePassword123!',
    });
    expect(loginResult.user.id).toBe(registerResult.user.id);

    // 3. Get Current User Profile
    const profile = await getCurrentUserHandler.handle(loginResult.user.id);
    expect(profile.username).toBe('alice');

    // 4. Refresh Token (Token Rotation)
    const refreshResult = await refreshTokenHandler.handle(
      loginResult.refreshToken,
    );
    expect(refreshResult.accessToken).toBeDefined();
    expect(refreshResult.refreshToken).toBeDefined();
    expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken);
  });

  it('should reject registration when email already exists', async () => {
    const registerDto = {
      username: 'alice',
      email: 'alice@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    await registerHandler.handle(registerDto);

    await expect(registerHandler.handle(registerDto)).rejects.toThrow(
      UserAlreadyExistException,
    );
  });

  it('should reject login with wrong password using real Argon2 comparison', async () => {
    await registerHandler.handle({
      username: 'alice',
      email: 'alice@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    });

    await expect(
      loginHandler.handle({
        email: 'alice@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should invalidate old refresh token after token rotation occurs', async () => {
    const registerRes = await registerHandler.handle({
      username: 'alice',
      email: 'alice@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    });

    const oldRefreshToken = registerRes.refreshToken;

    // First refresh succeeds and rotates token
    const firstRefreshRes = await refreshTokenHandler.handle(oldRefreshToken);
    expect(firstRefreshRes.refreshToken).not.toBe(oldRefreshToken);

    // Reusing old refresh token must be rejected
    await expect(refreshTokenHandler.handle(oldRefreshToken)).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });
});
