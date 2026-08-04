import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/interfaces/profile-repository';
import { GetStudentProfileHandler } from './get-student-profile.handler';

describe('GetStudentProfileHandler', () => {
  let handler: GetStudentProfileHandler;
  let profileRepoMock: any;

  beforeEach(async () => {
    profileRepoMock = {
      findStudentProfileByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentProfileHandler,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepoMock },
      ],
    }).compile();

    handler = module.get<GetStudentProfileHandler>(GetStudentProfileHandler);
  });

  it('should return student profile when found', async () => {
    const profile = StudentProfile.create({
      id: 'sp-1',
      userId: 'u-1',
      studentIdCode: 'STU101',
      gradeLevel: '10',
    });
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(profile);

    const result = await handler.handle('u-1');

    expect(result.id).toBe('sp-1');
    expect(result.studentIdCode).toBe('STU101');
  });

  it('should throw NotFoundDomainException when profile is not found', async () => {
    profileRepoMock.findStudentProfileByUserId.mockResolvedValue(null);

    await expect(handler.handle('nonexistent')).rejects.toThrow(
      NotFoundDomainException,
    );
  });
});
