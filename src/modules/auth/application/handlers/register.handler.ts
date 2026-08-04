import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventsNames } from 'src/shared/domain/constants/domain-events-names.enum';
import {
  ID_GENERATOR_TOKEN,
  type IdGenerator,
} from 'src/shared/domain/interfaces/id-generator';
import { User } from '../../domain/entities/user.entity';
import { UserAlreadyExistException } from '../../domain/exceptions/user-already-exist.exception';
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
import { RegisterUserDto } from '../dtos/register-user.dto';

@Injectable()
export class RegisterHandler {
  constructor(
    @Inject(ID_GENERATOR_TOKEN) private readonly idGenerator: IdGenerator,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(HASHER_TOKEN) private readonly hasher: Hasher,
    @Inject(TOKEN_SERVICE_TOKEN) private readonly tokenService: TokenService,
    private eventEmitter: EventEmitter2,
  ) {}

  async handle(dto: RegisterUserDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistException(dto.email);
    }
    const passwordHash = await this.hasher.hash(dto.password);
    const id = this.idGenerator.generate();
    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens({ email: dto.email, userId: id });
    const hashedRefreshToken = await this.hasher.hash(refreshToken);
    const user = User.create({
      id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      refreshTokenHash: hashedRefreshToken,
    });
    await this.userRepository.save(user);
    const events = user.pullDomainEvents();
    events.forEach((event) =>
      this.eventEmitter.emit(DomainEventsNames.USER_REGISTERED, event),
    );
    return {
      refreshToken,
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }
}
