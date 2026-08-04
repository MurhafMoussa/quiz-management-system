import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/shared/domain/enums/role.enum';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/interfaces/profile-repository';
import { UpdateTeacherProfileHandler } from './update-teacher-profile.handler';

describe('UpdateTeacherProfileHandler', () => {
  let handler: UpdateTeacherProfileHandler;
  let profileRepoMock: any;

  beforeEach(async () => {
    profileRepoMock = {
      findTeacherProfileByUserId: jest.fn(),
      saveTeacherProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTeacherProfileHandler,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepoMock },
      ],
    }).compile();

    handler = module.get<UpdateTeacherProfileHandler>(
      UpdateTeacherProfileHandler,
    );
  });

  it('should successfully update teacher profile for self', async () => {
    const existingProfile = TeacherProfile.create({
      id: 'tp-1',
      userId: 'u-2',
      title: 'Mr.',
    });
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue(
      existingProfile,
    );

    const dto = { title: 'Prof.', department: 'Science' };
    const result = await handler.handle('u-2', Role.TEACHER, 'u-2', dto);

    expect(result.title).toBe('Prof.');
    expect(result.department).toBe('Science');
    expect(profileRepoMock.saveTeacherProfile).toHaveBeenCalledWith(
      existingProfile,
    );
  });

  it('should throw ForbiddenException if user tries to update profile for another user and is not admin', async () => {
    await expect(
      handler.handle('u-1', Role.TEACHER, 'u-2', { title: 'Prof.' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundDomainException if profile is not found', async () => {
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue(null);

    await expect(
      handler.handle('u-2', Role.TEACHER, 'u-2', { title: 'Prof.' }),
    ).rejects.toThrow(NotFoundDomainException);
  });
});
