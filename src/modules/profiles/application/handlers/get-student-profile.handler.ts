import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  type ProfileRepository,
} from '../../domain/interfaces/profile-repository';
import { StudentProfileResponseDto } from '../dtos/student-profile.dto';

@Injectable()
export class GetStudentProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async handle(userId: string): Promise<StudentProfileResponseDto> {
    const profile =
      await this.profileRepository.findStudentProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundDomainException({ resourceName: 'Student Profile' });
    }

    return {
      id: profile.id,
      userId: profile.userId,
      studentIdCode: profile.studentIdCode,
      gradeLevel: profile.gradeLevel,
      interests: profile.interests,
      major: profile.major,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
