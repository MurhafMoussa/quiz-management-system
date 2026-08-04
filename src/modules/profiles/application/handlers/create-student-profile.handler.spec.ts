import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { USER_REPOSITORY_TOKEN } from 'src/modules/auth/domain/interfaces/user-repository';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Role } from 'src/shared/domain/enums/role.enum';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { ID_GENERATOR_TOKEN } from 'src/shared/domain/interfaces/id-generator';
import { ProfileAlreadyExistsException } from '../../domain/exceptions/profile-already-exists.exception';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/interfaces/profile-repository';
import { CreateStudentProfileHandler } from './create-student-profile.handler';

describe('CreateStudentProfileHandler', () => {
  let handler: CreateStudentProfileHandler;
  let profileRepoMock: any;
  let userRepoMock: any;
  let idGeneratorMock: any;

  beforeEach(async () => {
    profileRepoMock = {
      findStudentProfileByUserId: jest.fn(),
      saveStudentProfile: jest.fn(),
    };
    userRepoMock = {
      findById: jest.fn(),
    };
    idGeneratorMock = {
      generate: jest.fn().mockReturnValue('gen-id-1'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStudentProfileHandler,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepoMock },
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepoMock },
        { provide: ID_GENERATOR_TOKEN, useValue: idGeneratorMock },
      ],
    }).compile();

    handler = module.get<CreateStudentProfileHandler>(
      CreateStudentProfileHandler,
    );
  });

  it('should successfully create student profile for self', async () => {
    const mockUser = User.create({
      id: 'u-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'j@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
    });
    userRepoMock.findById.mockResolvedValue(mockUser);
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(null);

    const dto = { studentIdCode: 'STU123', gradeLevel: '10', interests: [] };
    const result = await handler.handle('u-1', Role.STUDENT, 'u-1', dto);

    expect(profileRepoMock.saveStudentProfile).toHaveBeenCalled();
    expect(result.id).toBe('gen-id-1');
    expect(result.studentIdCode).toBe('STU123');
  });

  it('should throw ForbiddenException if user tries to create profile for another user and is not admin', async () => {
    const dto = { studentIdCode: 'STU123', interests: [] };

    await expect(
      handler.handle('u-1', Role.STUDENT, 'u-2', dto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow admin to create profile for another user', async () => {
    const mockUser = User.create({
      id: 'u-2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
    });
    userRepoMock.findById.mockResolvedValue(mockUser);
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(null);

    const dto = { studentIdCode: 'STU123', interests: [] };
    const result = await handler.handle('admin-1', Role.ADMIN, 'u-2', dto);

    expect(result.userId).toBe('u-2');
  });

  it('should throw NotFoundDomainException if target user is not found', async () => {
    userRepoMock.findById.mockResolvedValue(null);

    await expect(
      handler.handle('u-1', Role.STUDENT, 'u-1', {
        studentIdCode: 'STU123',
        interests: [],
      }),
    ).rejects.toThrow(NotFoundDomainException);
  });

  it('should throw ProfileAlreadyExistsException if profile already exists', async () => {
    const mockUser = User.create({
      id: 'u-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'j@example.com',
      passwordHash: 'hash',
      refreshTokenHash: undefined,
    });
    userRepoMock.findById.mockResolvedValue(mockUser);
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue({
      id: 'existing',
    });

    await expect(
      handler.handle('u-1', Role.STUDENT, 'u-1', {
        studentIdCode: 'STU123',
        interests: [],
      }),
    ).rejects.toThrow(ProfileAlreadyExistsException);
  });
});
