import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterHandler } from '../../application/handlers/register.handler';
import { LoginHandler } from '../../application/handlers/login.handler';
import { RefreshTokenHandler } from '../../application/handlers/refresh-token.handler';
import { VerifyEmailHandler } from '../../application/handlers/verify-email.handler';
import { UpdateUserRoleHandler } from '../../application/handlers/update-user-role.handler';
import { TOKEN_SERVICE_TOKEN } from '../../domain/interfaces/token.service';
import { Role } from 'src/shared/domain/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let registerHandler: jest.Mocked<RegisterHandler>;
  let loginHandler: jest.Mocked<LoginHandler>;
  let refreshTokenHandler: jest.Mocked<RefreshTokenHandler>;
  let verifyEmailHandler: jest.Mocked<VerifyEmailHandler>;
  let updateUserRoleHandler: jest.Mocked<UpdateUserRoleHandler>;

  beforeEach(async () => {
    registerHandler = { handle: jest.fn() } as any;
    loginHandler = { handle: jest.fn() } as any;
    refreshTokenHandler = { handle: jest.fn() } as any;
    verifyEmailHandler = { execute: jest.fn() } as any;
    updateUserRoleHandler = { handle: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterHandler, useValue: registerHandler },
        { provide: LoginHandler, useValue: loginHandler },
        { provide: RefreshTokenHandler, useValue: refreshTokenHandler },
        { provide: VerifyEmailHandler, useValue: verifyEmailHandler },
        { provide: UpdateUserRoleHandler, useValue: updateUserRoleHandler },
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
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'pass',
      confirmPassword: 'pass',
    };
    const expectedResponse = {
      accessToken: 'acc',
      refreshToken: 'ref',
      user: {
        id: 'u-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isVerified: false,
        role: Role.STUDENT,
      },
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
      user: {
        id: 'u-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isVerified: false,
        role: Role.STUDENT,
      },
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
      user: {
        id: 'u-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isVerified: false,
        role: Role.STUDENT,
      },
    };
    refreshTokenHandler.handle.mockResolvedValue(expectedResponse);

    const result = await controller.refresh(dto);

    expect(refreshTokenHandler.handle).toHaveBeenCalledWith('old-ref');
    expect(result).toEqual(expectedResponse);
  });

  it('should call verifyEmailHandler on verifyEmail()', async () => {
    const dto = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      code: '123456',
    };
    verifyEmailHandler.execute.mockResolvedValue(undefined);

    await controller.verifyEmail(dto);

    expect(verifyEmailHandler.execute).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      '123456',
    );
  });
});
