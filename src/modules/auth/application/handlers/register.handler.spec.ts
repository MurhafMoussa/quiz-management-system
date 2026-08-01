import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterHandler } from './register.handler';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../../domain/interfaces/user-repository';
import { HASHER_TOKEN, Hasher } from '../../domain/interfaces/hasher';
import {
  TOKEN_SERVICE_TOKEN,
  TokenService,
} from '../../domain/interfaces/token.service';
import {
  ID_GENERATOR_TOKEN,
  IdGenerator,
} from 'src/shared/domain/interfaces/id-generator';
import { UserAlreadyExistException } from '../../domain/exceptions/user-already-exist.exception';
import { User } from '../../domain/entities/user.entity';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { DomainEventsNames } from 'src/shared/domain/constants/domain-events-names.enum';

describe('RegisterHandler', () => {
  let handler: RegisterHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let hasher: jest.Mocked<Hasher>;
  let tokenService: jest.Mocked<TokenService>;
  let idGenerator: jest.Mocked<IdGenerator>;
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    eventEmitter = {
      emit: jest.fn(),
    };
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

    idGenerator = {
      generate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: HASHER_TOKEN, useValue: hasher },
        { provide: TOKEN_SERVICE_TOKEN, useValue: tokenService },
        { provide: ID_GENERATOR_TOKEN, useValue: idGenerator },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    handler = module.get<RegisterHandler>(RegisterHandler);
  });

  it('should successfully register a new user', async () => {
    const registerDto = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    idGenerator.generate.mockReturnValue('generated-uuid');
    hasher.hash
      .mockResolvedValueOnce('hashedPassword')
      .mockResolvedValueOnce('hashedRefreshToken');
    tokenService.generateTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await handler.handle(registerDto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(hasher.hash).toHaveBeenNthCalledWith(1, registerDto.password);
    expect(idGenerator.generate).toHaveBeenCalled();
    expect(tokenService.generateTokens).toHaveBeenCalledWith({
      email: registerDto.email,
      userId: 'generated-uuid',
    });
    expect(hasher.hash).toHaveBeenNthCalledWith(2, 'refresh-token');
    expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      DomainEventsNames.USER_REGISTERED,
      expect.any(UserRegisteredEvent),
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'generated-uuid',
        username: registerDto.username,
        email: registerDto.email,
      },
    });
  });

  it('should throw UserAlreadyExistException if user email already exists', async () => {
    const registerDto = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const existingUser = User.create({
      id: 'existing-id',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
    });

    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(handler.handle(registerDto)).rejects.toThrow(
      UserAlreadyExistException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
