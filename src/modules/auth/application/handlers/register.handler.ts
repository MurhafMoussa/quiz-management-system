import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventsNames } from 'src/shared/domain/constants/domain-events-names.enum';
import { AlreadyExistDomainException } from 'src/shared/domain/exceptions/already-exist-domain.exception';
import {
  ID_GENERATOR_TOKEN,
  type IdGenerator,
} from 'src/shared/domain/interfaces/id-generator';
import { User } from '../../domain/entities/user.entity';
import { HASHER_TOKEN, type Hasher } from '../../domain/interfaces/hasher';
import {
  TOKEN_SERVICE_TOKEN,
  type TokenService,
} from '../../domain/interfaces/token.service';
import {
  USER_REPOSITORY_TOKEN,
  type UserRepository,
} from '../../domain/interfaces/user-repository';
import { UserMapper } from '../../infrastructure/mappers/user.mapper';
import { AuthResponseDto } from 'src/shared/application/dtos/user-response.dto';
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
      throw new AlreadyExistDomainException({ resourceName: 'User' });
    }
    const passwordHash = await this.hasher.hash(dto.password);
    const id = this.idGenerator.generate();
    const user = User.create({
      id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      refreshTokenHash: undefined,
      role: dto.role,
    });
    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens({
        email: dto.email,
        userId: id,
        role: user.role,
      });
    const hashedRefreshToken = await this.hasher.hash(refreshToken);
    user.changeRefreshToken(hashedRefreshToken);
    await this.userRepository.save(user);
    const events = user.pullDomainEvents();
    events.forEach((event) =>
      this.eventEmitter.emit(DomainEventsNames.USER_REGISTERED, event),
    );
    return {
      refreshToken,
      accessToken,
      user: UserMapper.toResponse(user),
    };
  }
}
