import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  type ProfileRepository,
} from '../../domain/interfaces/profile-repository';
import { TeacherProfileResponseDto } from '../dtos/teacher-profile.dto';

@Injectable()
export class GetTeacherProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async handle(userId: string): Promise<TeacherProfileResponseDto> {
    const profile =
      await this.profileRepository.findTeacherProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundDomainException({ resourceName: 'Teacher Profile' });
    }

    return {
      id: profile.id,
      userId: profile.userId,
      title: profile.title,
      bio: profile.bio,
      department: profile.department,
      subjectSpecialties: profile.subjectSpecialties,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
