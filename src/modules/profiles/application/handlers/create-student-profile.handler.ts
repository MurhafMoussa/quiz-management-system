import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from 'src/modules/auth/domain/interfaces/user-repository';
import { Role } from 'src/shared/domain/enums/role.enum';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  ID_GENERATOR_TOKEN,
  type IdGenerator,
} from 'src/shared/domain/interfaces/id-generator';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { ProfileAlreadyExistsException } from '../../domain/exceptions/profile-already-exists.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  type ProfileRepository,
} from '../../domain/interfaces/profile-repository';
import {
  CreateStudentProfileDto,
  StudentProfileResponseDto,
} from '../dtos/student-profile.dto';

@Injectable()
export class CreateStudentProfileHandler {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: ProfileRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(ID_GENERATOR_TOKEN)
    private readonly idGenerator: IdGenerator,
  ) {}

  async handle(
    currentUserId: string,
    currentUserRole: Role,
    targetUserId: string,
    dto: CreateStudentProfileDto,
  ): Promise<StudentProfileResponseDto> {
    if (currentUserId !== targetUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to create this profile',
      );
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundDomainException({ resourceName: 'User' });
    }

    const existingProfile =
      await this.profileRepository.findStudentProfileByUserId(targetUserId);
    if (existingProfile) {
      throw new ProfileAlreadyExistsException();
    }

    const id = this.idGenerator.generate();
    const profile = StudentProfile.create({
      id,
      userId: targetUserId,
      studentIdCode: dto.studentIdCode,
      gradeLevel: dto.gradeLevel,
      interests: dto.interests,
      major: dto.major,
    });

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
