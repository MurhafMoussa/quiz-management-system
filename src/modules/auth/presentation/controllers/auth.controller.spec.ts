import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterHandler } from '../../application/handlers/register.handler';
import { LoginHandler } from '../../application/handlers/login.handler';
import { RefreshTokenHandler } from '../../application/handlers/refresh-token.handler';
import { GetCurrentUserHandler } from '../../application/handlers/get-current-user.handler';
import { TOKEN_SERVICE_TOKEN } from '../../domain/interfaces/token.service';

describe('AuthController', () => {
  let controller: AuthController;
  let registerHandler: jest.Mocked<RegisterHandler>;
  let loginHandler: jest.Mocked<LoginHandler>;
  let refreshTokenHandler: jest.Mocked<RefreshTokenHandler>;
  let getCurrentUserHandler: jest.Mocked<GetCurrentUserHandler>;

  beforeEach(async () => {
    registerHandler = { handle: jest.fn() } as any;
    loginHandler = { handle: jest.fn() } as any;
    refreshTokenHandler = { handle: jest.fn() } as any;
    getCurrentUserHandler = { handle: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterHandler, useValue: registerHandler },
        { provide: LoginHandler, useValue: loginHandler },
        { provide: RefreshTokenHandler, useValue: refreshTokenHandler },
        { provide: GetCurrentUserHandler, useValue: getCurrentUserHandler },
        {
          provide: TOKEN_SERVICE_TOKEN,
          useValue: {
            generateTokens: jest.fn(),
            verifyAccessToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call registerHandler on register()', async () => {
    const dto = {
      username: 'john',
      email: 'john@example.com',
      password: 'pass',
      confirmPassword: 'pass',
    };
    const expectedResponse = {
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { id: 'u-1', username: 'john', email: 'john@example.com' },
    };
    registerHandler.handle.mockResolvedValue(expectedResponse);

    const result = await controller.register(dto);

    expect(registerHandler.handle).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResponse);
  });

  it('should call loginHandler on login()', async () => {
    const dto = { email: 'john@example.com', password: 'pass' };
    const expectedResponse = {
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { id: 'u-1', username: 'john', email: 'john@example.com' },
    };
    loginHandler.handle.mockResolvedValue(expectedResponse);

    const result = await controller.login(dto);

    expect(loginHandler.handle).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResponse);
  });

  it('should call refreshTokenHandler on refresh()', async () => {
    const dto = { refreshToken: 'old-ref' };
    const expectedResponse = {
      accessToken: 'new-acc',
      refreshToken: 'old-ref',
      user: { id: 'u-1', username: 'john', email: 'john@example.com' },
    };
    refreshTokenHandler.handle.mockResolvedValue(expectedResponse);

    const result = await controller.refresh(dto);

    expect(refreshTokenHandler.handle).toHaveBeenCalledWith('old-ref');
    expect(result).toEqual(expectedResponse);
  });

  it('should call getCurrentUserHandler on getCurrentUser()', async () => {
    const payload = { userId: 'u-1', email: 'john@example.com' };
    const expectedResponse = {
      id: 'u-1',
      username: 'john',
      email: 'john@example.com',
    };
    getCurrentUserHandler.handle.mockResolvedValue(expectedResponse);

    const result = await controller.getCurrentUser(payload);

    expect(getCurrentUserHandler.handle).toHaveBeenCalledWith('u-1');
    expect(result).toEqual(expectedResponse);
  });
});
