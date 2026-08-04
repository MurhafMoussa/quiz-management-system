import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/modules/auth/domain/enums/role.enum';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/interfaces/profile-repository';
import { UpdateStudentProfileHandler } from './update-student-profile.handler';

describe('UpdateStudentProfileHandler', () => {
  let handler: UpdateStudentProfileHandler;
  let profileRepoMock: any;

  beforeEach(async () => {
    profileRepoMock = {
      findStudentProfileByUserId: jest.fn(),
      saveStudentProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStudentProfileHandler,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepoMock },
      ],
    }).compile();

    handler = module.get<UpdateStudentProfileHandler>(
      UpdateStudentProfileHandler,
    );
  });

  it('should successfully update student profile for self', async () => {
    const existingProfile = StudentProfile.create({
      id: 'sp-1',
      userId: 'u-1',
      studentIdCode: 'STU101',
      gradeLevel: '9',
    });
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(
      existingProfile,
    );

    const dto = { gradeLevel: '10', major: 'Math' };
    const result = await handler.handle('u-1', Role.STUDENT, 'u-1', dto);

    expect(result.gradeLevel).toBe('10');
    expect(result.major).toBe('Math');
    expect(profileRepoMock.saveStudentProfile).toHaveBeenCalledWith(
      existingProfile,
    );
  });

  it('should throw ForbiddenException if user tries to update profile for another user and is not admin', async () => {
    await expect(
      handler.handle('u-1', Role.STUDENT, 'u-2', { gradeLevel: '10' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow admin to update profile for another user', async () => {
    const existingProfile = StudentProfile.create({
      id: 'sp-2',
      userId: 'u-2',
      studentIdCode: 'STU102',
    });
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(
      existingProfile,
    );

    const result = await handler.handle('admin-1', Role.ADMIN, 'u-2', {
      gradeLevel: '12',
    });

    expect(result.gradeLevel).toBe('12');
  });

  it('should throw NotFoundDomainException if profile is not found', async () => {
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(null);

    await expect(
      handler.handle('u-1', Role.STUDENT, 'u-1', { gradeLevel: '10' }),
    ).rejects.toThrow(NotFoundDomainException);
  });
});
