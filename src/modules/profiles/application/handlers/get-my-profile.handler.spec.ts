import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/interfaces/profile-repository';
import { GetMyProfileHandler } from './get-my-profile.handler';

describe('GetMyProfileHandler', () => {
  let handler: GetMyProfileHandler;
  let profileRepoMock: any;

  beforeEach(async () => {
    profileRepoMock = {
      findStudentProfileByUserId: jest.fn(),
      findTeacherProfileByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyProfileHandler,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepoMock },
      ],
    }).compile();

    handler = module.get<GetMyProfileHandler>(GetMyProfileHandler);
  });

  it('should return student profile if user is a student', async () => {
    const student = StudentProfile.create({
      id: 'sp-1',
      userId: 'u-1',
      studentIdCode: 'STU1',
    });
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(student);

    const result = await handler.handle('u-1');

    expect(result.type).toBe('STUDENT');
    expect(result.profile.id).toBe('sp-1');
  });

  it('should return teacher profile if user is a teacher', async () => {
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(null);
    const teacher = TeacherProfile.create({
      id: 'tp-1',
      userId: 'u-2',
      title: 'Dr.',
    });
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue(teacher);

    const result = await handler.handle('u-2');

    expect(result.type).toBe('TEACHER');
    expect(result.profile.id).toBe('tp-1');
  });

  it('should throw NotFoundDomainException if no profile is found', async () => {
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(null);
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue(null);

    await expect(handler.handle('u-3')).rejects.toThrow(
      NotFoundDomainException,
    );
  });
});
