import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { RegisterHandler } from './application/handlers/register.handler';
import { PASSWORD_HASHER_TOKEN } from './domain/interfaces/password-hasher';
import { USER_REPOSITORY_TOKEN } from './domain/interfaces/user-repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { ArgonPasswordHasher } from './infrastructure/services/argon-password-hasher';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginHandler } from './application/handlers/login.handler';


@Module({
    imports: [SharedModule],
    controllers: [AuthController],
    providers: [
        RegisterHandler,
        LoginHandler,
        {
            provide: PASSWORD_HASHER_TOKEN,
            useClass: ArgonPasswordHasher,
        },
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: PrismaUserRepository,
        },
    ],
})
export class AuthModule { }