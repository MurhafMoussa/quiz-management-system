import { Inject, Injectable } from '@nestjs/common';
import { HASHER_TOKEN, type Hasher } from '../../domain/interfaces/hasher';
import {
  TOKEN_SERVICE_TOKEN,
  type TokenService,
} from '../../domain/interfaces/token.service';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from '../../domain/interfaces/user-repository';
import { InvalidRefreshTokenException } from '../../infrastructure/exceptions/invalid-refresh-token.exception';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class RefreshTokenHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(HASHER_TOKEN) private readonly hasher: Hasher,
    @Inject(TOKEN_SERVICE_TOKEN) private readonly tokenService: TokenService,
  ) {}

  async handle(oldRefreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(oldRefreshToken);
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.refreshTokenHash) {
      throw new InvalidRefreshTokenException();
    }
    const isRefreshTokensIdentical = await this.hasher.compare(
      oldRefreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshTokensIdentical) {
      throw new InvalidRefreshTokenException();
    }
    const { refreshToken, accessToken } =
      await this.tokenService.generateTokens({
        userId: user.id,
        email: user.email,
      });
    const newHash = await this.hasher.hash(refreshToken);
    user.changeRefreshToken(newHash);
    await this.userRepository.save(user);
    return {
      refreshToken,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
