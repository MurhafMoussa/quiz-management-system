import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from 'src/modules/auth/domain/interfaces/user-repository';
import { Role } from 'src/modules/auth/domain/enums/role.enum';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  ID_GENERATOR_TOKEN,
  type IdGenerator,
} from 'src/shared/domain/interfaces/id-generator';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';
import { ProfileAlreadyExistsException } from '../../domain/exceptions/profile-already-exists.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  type ProfileRepository,
} from '../../domain/interfaces/profile-repository';
import {
  CreateTeacherProfileDto,
  TeacherProfileResponseDto,
} from '../dtos/teacher-profile.dto';

@Injectable()
export class CreateTeacherProfileHandler {
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
    dto: CreateTeacherProfileDto,
  ): Promise<TeacherProfileResponseDto> {
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
      await this.profileRepository.findTeacherProfileByUserId(targetUserId);
    if (existingProfile) {
      throw new ProfileAlreadyExistsException();
    }

    const id = this.idGenerator.generate();
    const profile = TeacherProfile.create({
      id,
      userId: targetUserId,
      title: dto.title,
      bio: dto.bio,
      department: dto.department,
      subjectSpecialties: dto.subjectSpecialties,
    });

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
