import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtTokenService } from '../../src/modules/auth/infrastructure/services/jwt.service';
import { InvalidAccessTokenException } from '../../src/modules/auth/infrastructure/exceptions/invalid-access-token.exception';
import { InvalidRefreshTokenException } from '../../src/modules/auth/infrastructure/exceptions/invalid-refresh-token.exception';

describe('JwtTokenService Integration', () => {
  let tokenService: JwtTokenService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_TOKEN_SECRET = 'access-token-secret-key-123456';
    process.env.JWT_REFRESH_TOKEN_SECRET = 'refresh-token-secret-key-123456';
    process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS = '3600000';
    process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS = '86400000';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({}),
      ],
      providers: [JwtTokenService],
    }).compile();

    tokenService = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should generate real JWT tokens and verify access token payload', async () => {
    const payload = { userId: 'user-uuid-v7', email: 'test@example.com' };
    const tokens = await tokenService.generateTokens(payload);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.accessToken).not.toEqual(tokens.refreshToken);

    const verifiedAccess = await tokenService.verifyAccessToken(tokens.accessToken);
    expect(verifiedAccess.userId).toBe(payload.userId);
    expect(verifiedAccess.email).toBe(payload.email);
  });

  it('should verify real refresh token payload', async () => {
    const payload = { userId: 'user-uuid-v7', email: 'test@example.com' };
    const tokens = await tokenService.generateTokens(payload);

    const verifiedRefresh = await tokenService.verifyRefreshToken(tokens.refreshToken);
    expect(verifiedRefresh.userId).toBe(payload.userId);
    expect(verifiedRefresh.email).toBe(payload.email);
  });

  it('should reject access token when verified with refresh token secret', async () => {
    const payload = { userId: 'user-uuid-v7', email: 'test@example.com' };
    const tokens = await tokenService.generateTokens(payload);

    await expect(tokenService.verifyRefreshToken(tokens.accessToken)).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });

  it('should reject tampered or malformed tokens', async () => {
    await expect(tokenService.verifyAccessToken('invalid.jwt.token')).rejects.toThrow(
      InvalidAccessTokenException,
    );
    await expect(tokenService.verifyRefreshToken('invalid.jwt.token')).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });
});
