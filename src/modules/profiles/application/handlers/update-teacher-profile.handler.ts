import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/shared/domain/enums/role.enum';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  type ProfileRepository,
} from '../../domain/interfaces/profile-repository';
import {
  TeacherProfileResponseDto,
  UpdateTeacherProfileDto,
} from '../dtos/teacher-profile.dto';

@Injectable()
export class UpdateTeacherProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async handle(
    currentUserId: string,
    currentUserRole: Role,
    targetUserId: string,
    dto: UpdateTeacherProfileDto,
  ): Promise<TeacherProfileResponseDto> {
    if (currentUserId !== targetUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to update this profile',
      );
    }

    const profile =
      await this.profileRepository.findTeacherProfileByUserId(targetUserId);
    if (!profile) {
      throw new NotFoundDomainException({ resourceName: 'Teacher Profile' });
    }

    profile.updateProfile(dto);
    await this.profileRepository.saveTeacherProfile(profile);

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
