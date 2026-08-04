import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-found-domain.exception';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from 'src/modules/auth/domain/interfaces/user-repository';
import { UserMapper } from 'src/modules/auth/infrastructure/mappers/user.mapper';
import { UserResponseDto } from 'src/shared/application/dtos/user-response.dto';

@Injectable()
export class GetMyProfileHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
  ) {}

  async handle(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundDomainException({ resourceName: 'User' });
    }

    return UserMapper.toResponse(user);
  }
}
