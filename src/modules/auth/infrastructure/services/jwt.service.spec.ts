import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenService } from './jwt.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InvalidAccessTokenException } from '../exceptions/invalid-access-token.exception';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as any;

    configService = {
      get: jest.fn((key: string) => {
        const configMap: Record<string, string | number> = {
          JWT_ACCESS_TOKEN_SECRET: 'access-secret',
          JWT_ACCESS_TOKEN_EXPIRATION_MS: 3600,
          JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
          JWT_REFRESH_TOKEN_EXPIRATION_MS: 86400,
        };
        return configMap[key];
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should generate access and refresh tokens correctly', async () => {
    jwtService.signAsync
      .mockResolvedValueOnce('acc-token')
      .mockResolvedValueOnce('ref-token');

    const payload = { userId: 'u-1', email: 'test@example.com' };
    const result = await service.generateTokens(payload);

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, payload, {
      secret: 'access-secret',
      expiresIn: 3600,
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, payload, {
      secret: 'refresh-secret',
      expiresIn: 86400,
    });
    expect(result).toEqual({ accessToken: 'acc-token', refreshToken: 'ref-token' });
  });

  it('should verify access token successfully', async () => {
    const payload = { userId: 'u-1', email: 'test@example.com' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const result = await service.verifyAccessToken('valid-access-token');

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-access-token', {
      secret: 'access-secret',
    });
    expect(result).toEqual(payload);
  });

  it('should throw InvalidAccessTokenException on verification failure', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(service.verifyAccessToken('bad-token')).rejects.toThrow(
      InvalidAccessTokenException,
    );
  });

  it('should verify refresh token successfully', async () => {
    const payload = { userId: 'u-1', email: 'test@example.com' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const result = await service.verifyRefreshToken('valid-refresh-token');

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', {
      secret: 'refresh-secret',
    });
    expect(result).toEqual(payload);
  });

  it('should throw InvalidRefreshTokenException on verification failure', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(service.verifyRefreshToken('bad-token')).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });
});
