import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  type ProfileRepository,
} from '../../domain/interfaces/profile-repository';

@Injectable()
export class GetMyProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async handle(userId: string) {
    const studentProfile =
      await this.profileRepository.findStudentProfileByUserId(userId);
    if (studentProfile) {
      return {
        type: 'STUDENT',
        profile: {
          id: studentProfile.id,
          userId: studentProfile.userId,
          studentIdCode: studentProfile.studentIdCode,
          gradeLevel: studentProfile.gradeLevel,
          interests: studentProfile.interests,
          major: studentProfile.major,
          createdAt: studentProfile.createdAt,
          updatedAt: studentProfile.updatedAt,
        },
      };
    }

    const teacherProfile =
      await this.profileRepository.findTeacherProfileByUserId(userId);
    if (teacherProfile) {
      return {
        type: 'TEACHER',
        profile: {
          id: teacherProfile.id,
          userId: teacherProfile.userId,
          title: teacherProfile.title,
          bio: teacherProfile.bio,
          department: teacherProfile.department,
          subjectSpecialties: teacherProfile.subjectSpecialties,
          createdAt: teacherProfile.createdAt,
          updatedAt: teacherProfile.updatedAt,
        },
      };
    }

    throw new NotFoundDomainException({ resourceName: 'Profile' });
  }
}
