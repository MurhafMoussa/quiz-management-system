import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { LoginHandler } from './application/handlers/login.handler';
import { RegisterHandler } from './application/handlers/register.handler';
import { HASHER_TOKEN } from './domain/interfaces/hasher';
import { OTP_REPOSITORY_TOKEN } from './domain/interfaces/otp-repository';
import { TOKEN_SERVICE_TOKEN } from './domain/interfaces/token.service';
import { USER_REPOSITORY_TOKEN } from './domain/interfaces/user-repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { RedisOtpRepository } from './infrastructure/repositories/redis-otp-repository';
import { ArgonPasswordHasher } from './infrastructure/services/argon-string-hasher';
import { JwtTokenService } from './infrastructure/services/jwt.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { RefreshTokenHandler } from './application/handlers/refresh-token.handler';
import { GetCurrentUserHandler } from './application/handlers/get-current-user.handler';
import { VerifyEmailHandler } from './application/handlers/verify-email.handler';
import { UserRegisteredListener } from './application/listeners/user-registered.listener';

@Module({
  imports: [
    NotificationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterHandler,
    LoginHandler,
    RefreshTokenHandler,
    GetCurrentUserHandler,
    VerifyEmailHandler,
    UserRegisteredListener,
    {
      provide: HASHER_TOKEN,
      useClass: ArgonPasswordHasher,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
    {
      provide: TOKEN_SERVICE_TOKEN,
      useClass: JwtTokenService,
    },
    {
      provide: OTP_REPOSITORY_TOKEN,
      useClass: RedisOtpRepository,
    },
  ],
})
export class AuthModule {}
