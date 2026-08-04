import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { USER_REPOSITORY_TOKEN } from 'src/modules/auth/domain/interfaces/user-repository';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Role } from 'src/shared/domain/enums/role.enum';
import { GetMyProfileHandler } from './get-my-profile.handler';

describe('GetMyProfileHandler', () => {
  let handler: GetMyProfileHandler;
  let userRepoMock: any;

  beforeEach(async () => {
    userRepoMock = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyProfileHandler,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepoMock },
      ],
    }).compile();

    handler = module.get<GetMyProfileHandler>(GetMyProfileHandler);
  });

  it('should return user and student profile if user is a student and has a profile', async () => {
    const user = User.rehydrate({
      id: 'u-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
      isVerified: true,
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    user.profile = {
      id: 'sp-1',
      userId: 'u-1',
      studentIdCode: 'STU1',
      gradeLevel: 'Freshman',
      interests: [],
      major: 'CS',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userRepoMock.findById.mockResolvedValue(user);

    const result = await handler.handle('u-1');

    expect(result.id).toBe('u-1');
    expect(result.role).toBe(Role.STUDENT);
    expect(result.profile).toBeDefined();
    expect(result.profile!.id).toBe('sp-1');
  });

  it('should return user and null profile if user has no profile yet', async () => {
    const user = User.rehydrate({
      id: 'u-2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
      isVerified: true,
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userRepoMock.findById.mockResolvedValue(user);

    const result = await handler.handle('u-2');

    expect(result.id).toBe('u-2');
    expect(result.profile).toBeNull();
  });

  it('should throw NotFoundDomainException if user is not found', async () => {
    userRepoMock.findById.mockResolvedValue(null);

    await expect(handler.handle('u-3')).rejects.toThrow(
      NotFoundDomainException,
    );
  });
});
