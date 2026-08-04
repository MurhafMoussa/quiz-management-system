import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { User } from '../../domain/entities/user.entity';
import { Role } from 'src/shared/domain/enums/role.enum';
import { USER_REPOSITORY_TOKEN } from '../../domain/interfaces/user-repository';
import { UpdateUserRoleHandler } from './update-user-role.handler';

describe('UpdateUserRoleHandler', () => {
  let handler: UpdateUserRoleHandler;
  let userRepositoryMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserRoleHandler,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    handler = module.get<UpdateUserRoleHandler>(UpdateUserRoleHandler);
  });

  it('should update user role successfully', async () => {
    const user = User.create({
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
      role: Role.STUDENT,
    });

    userRepositoryMock.findById.mockResolvedValue(user);
    userRepositoryMock.save.mockResolvedValue(user);

    const result = await handler.handle('user-1', { role: Role.ADMIN });

    expect(userRepositoryMock.findById).toHaveBeenCalledWith('user-1');
    expect(user.role).toBe(Role.ADMIN);
    expect(userRepositoryMock.save).toHaveBeenCalledWith(user);
    expect(result.role).toBe(Role.ADMIN);
  });

  it('should throw NotFoundDomainException if user is not found', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      handler.handle('nonexistent', { role: Role.TEACHER }),
    ).rejects.toThrow(NotFoundDomainException);
  });
});
