import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/shared/domain/enums/role.enum';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  type ProfileRepository,
} from '../../domain/interfaces/profile-repository';
import {
  StudentProfileResponseDto,
  UpdateStudentProfileDto,
} from '../dtos/student-profile.dto';

@Injectable()
export class UpdateStudentProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async handle(
    currentUserId: string,
    currentUserRole: Role,
    targetUserId: string,
    dto: UpdateStudentProfileDto,
  ): Promise<StudentProfileResponseDto> {
    if (currentUserId !== targetUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to update this profile',
      );
    }

    const profile =
      await this.profileRepository.findStudentProfileByUserId(targetUserId);
    if (!profile) {
      throw new NotFoundDomainException({ resourceName: 'Student Profile' });
    }

    profile.updateProfile(dto);
    await this.profileRepository.saveStudentProfile(profile);

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
