import { Inject, Injectable } from '@nestjs/common';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { UserNotVerifiedException } from '../../domain/exceptions/user-not-verified.exception';
import { HASHER_TOKEN, type Hasher } from '../../domain/interfaces/hasher';
import {
  TOKEN_SERVICE_TOKEN,
  type TokenService,
} from '../../domain/interfaces/token.service';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from '../../domain/interfaces/user-repository';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginUserDto } from '../dtos/login-user.dto';

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(HASHER_TOKEN) private readonly hasher: Hasher,
    @Inject(TOKEN_SERVICE_TOKEN) private readonly tokenService: TokenService,
  ) {}

  async handle(dto: LoginUserDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (!existingUser) {
      throw new InvalidCredentialsException();
    }
    const passwordIsCorrect = await this.hasher.compare(
      dto.password,
      existingUser.passwordHash,
    );
    if (!passwordIsCorrect) {
      throw new InvalidCredentialsException();
    }
    if (!existingUser.isVerified) {
      throw new UserNotVerifiedException();
    }
    const { refreshToken, accessToken } =
      await this.tokenService.generateTokens({
        email: existingUser.email,
        userId: existingUser.id,
        role: existingUser.role,
      });
    const hashedRefreshToken = await this.hasher.hash(refreshToken);
    existingUser.changeRefreshToken(hashedRefreshToken);
    await this.userRepository.save(existingUser);
    return {
      refreshToken,
      accessToken,
      user: {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        isVerified: existingUser.isVerified,
        role: existingUser.role,
      },
    };
  }
}
