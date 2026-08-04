import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { USER_REPOSITORY_TOKEN } from 'src/modules/auth/domain/interfaces/user-repository';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Role } from 'src/shared/domain/enums/role.enum';
import { ID_GENERATOR_TOKEN } from 'src/shared/domain/interfaces/id-generator';
import { ProfileAlreadyExistsException } from '../../domain/exceptions/profile-already-exists.exception';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/interfaces/profile-repository';
import { CreateTeacherProfileHandler } from './create-teacher-profile.handler';

describe('CreateTeacherProfileHandler', () => {
  let handler: CreateTeacherProfileHandler;
  let profileRepoMock: any;
  let userRepoMock: any;
  let idGeneratorMock: any;

  beforeEach(async () => {
    profileRepoMock = {
      findTeacherProfileByUserId: jest.fn(),
      saveTeacherProfile: jest.fn(),
    };
    userRepoMock = {
      findById: jest.fn(),
    };
    idGeneratorMock = {
      generate: jest.fn().mockReturnValue('gen-id-2'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTeacherProfileHandler,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepoMock },
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepoMock },
        { provide: ID_GENERATOR_TOKEN, useValue: idGeneratorMock },
      ],
    }).compile();

    handler = module.get<CreateTeacherProfileHandler>(
      CreateTeacherProfileHandler,
    );
  });

  it('should successfully create teacher profile for self', async () => {
    const mockUser = User.create({
      id: 'u-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
      role: Role.TEACHER,
    });
    userRepoMock.findById.mockResolvedValue(mockUser);
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue(null);

    const dto = { title: 'Dr.', bio: 'Bio', subjectSpecialties: [] };
    const result = await handler.handle('u-2', Role.TEACHER, 'u-2', dto);

    expect(profileRepoMock.saveTeacherProfile).toHaveBeenCalled();
    expect(result.id).toBe('gen-id-2');
    expect(result.title).toBe('Dr.');
  });

  it('should throw ForbiddenException if user tries to create profile for another user and is not admin', async () => {
    await expect(
      handler.handle('u-1', Role.TEACHER, 'u-2', {
        title: 'Dr.',
        subjectSpecialties: [],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ProfileAlreadyExistsException if profile already exists', async () => {
    const mockUser = User.create({
      id: 'u-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
    });
    userRepoMock.findById.mockResolvedValue(mockUser);
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue({
      id: 'existing',
    });

    await expect(
      handler.handle('u-2', Role.TEACHER, 'u-2', {
        title: 'Dr.',
        subjectSpecialties: [],
      }),
    ).rejects.toThrow(ProfileAlreadyExistsException);
  });
});
