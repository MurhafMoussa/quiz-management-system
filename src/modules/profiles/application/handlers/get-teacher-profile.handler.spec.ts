import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/interfaces/profile-repository';
import { GetTeacherProfileHandler } from './get-teacher-profile.handler';

describe('GetTeacherProfileHandler', () => {
  let handler: GetTeacherProfileHandler;
  let profileRepoMock: any;

  beforeEach(async () => {
    profileRepoMock = {
      findTeacherProfileByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTeacherProfileHandler,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepoMock },
      ],
    }).compile();

    handler = module.get<GetTeacherProfileHandler>(GetTeacherProfileHandler);
  });

  it('should return teacher profile when found', async () => {
    const profile = TeacherProfile.create({
      id: 'tp-1',
      userId: 'u-2',
      title: 'Dr.',
    });
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue(profile);

    const result = await handler.handle('u-2');

    expect(result.id).toBe('tp-1');
    expect(result.title).toBe('Dr.');
  });

  it('should throw NotFoundDomainException when profile is not found', async () => {
    profileRepoMock.findTeacherProfileByUserId.mockResolvedValue(null);

    await expect(handler.handle('nonexistent')).rejects.toThrow(
      NotFoundDomainException,
    );
  });
});
