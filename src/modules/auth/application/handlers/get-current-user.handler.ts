import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from 'src/shared/domain/exceptions/not-dound-domain.exception';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from '../../domain/interfaces/user-repository';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class GetCurrentUserHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
  ) {}

  async handle(userId: string): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundDomainException({ resourceName: 'User' });
    }

    return {
      email: existingUser.email,
      id: existingUser.id,
      username: existingUser.username,
      isVerified: existingUser.isVerified,
    };
  }
}
