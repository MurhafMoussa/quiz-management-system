import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from '../../domain/interfaces/user-repository';
import { UpdateUserRoleDto } from '../dtos/update-user-role.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class UpdateUserRoleHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
  ) {}

  async handle(
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundDomainException({ resourceName: 'User' });
    }

    user.changeRole(dto.role);
    await this.userRepository.save(user);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    };
  }
}
