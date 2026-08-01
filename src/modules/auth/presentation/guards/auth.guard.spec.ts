import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import {
  TOKEN_SERVICE_TOKEN,
  TokenService,
} from '../../domain/interfaces/token.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    tokenService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: TOKEN_SERVICE_TOKEN, useValue: tokenService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  const createMockContext = (
    authorizationHeader?: string,
  ): ExecutionContext => {
    const request: any = {
      headers: {
        authorization: authorizationHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  };

  it('should allow access and attach payload to request if valid Bearer token is provided', async () => {
    const context = createMockContext('Bearer valid-token');
    const payload = { userId: 'u-1', email: 'john@example.com' };
    tokenService.verifyAccessToken.mockResolvedValue(payload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(tokenService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
    expect(context.switchToHttp().getRequest()['user']).toEqual(payload);
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const context = createMockContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if authorization scheme is not Bearer', async () => {
    const context = createMockContext('Basic token123');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
