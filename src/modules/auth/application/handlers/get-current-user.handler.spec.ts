import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentUserHandler } from './get-current-user.handler';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../../domain/interfaces/user-repository';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-dound-domain.exception';
import { User } from '../../domain/entities/user.entity';

describe('GetCurrentUserHandler', () => {
  let handler: GetCurrentUserHandler;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserHandler,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
      ],
    }).compile();

    handler = module.get<GetCurrentUserHandler>(GetCurrentUserHandler);
  });

  it('should return user response DTO if user exists', async () => {
    const mockUser = User.rehydrate({
      id: 'user-123',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.findById.mockResolvedValue(mockUser);

    const result = await handler.handle('user-123');

    expect(userRepository.findById).toHaveBeenCalledWith('user-123');
    expect(result).toEqual({
      id: 'user-123',
      username: 'johndoe',
      email: 'john@example.com',
    });
  });

  it('should throw NotFoundDomainException if user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(handler.handle('nonexistent-user')).rejects.toThrow(
      NotFoundDomainException,
    );
  });
});
