import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from 'src/shared/shared.module';
import { LoginHandler } from './application/handlers/login.handler';
import { RegisterHandler } from './application/handlers/register.handler';
import { HASHER_TOKEN } from './domain/interfaces/hasher';
import { TOKEN_SERVICE_TOKEN } from './domain/interfaces/token.service';
import { USER_REPOSITORY_TOKEN } from './domain/interfaces/user-repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { ArgonPasswordHasher } from './infrastructure/services/argon-string-hasher';
import { JwtTokenService } from './infrastructure/services/jwt.service';
import { AuthController } from './presentation/controllers/auth.controller';


@Module({
    imports: [SharedModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS',) as any,

                }
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        RegisterHandler,
        LoginHandler,
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
    ],
})
export class AuthModule { }