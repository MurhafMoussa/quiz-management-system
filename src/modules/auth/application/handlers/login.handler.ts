import { Inject, Injectable } from "@nestjs/common";
import { InvalidCredentialsException } from "../../domain/exceptions/invalid-credentials.exception";
import { PASSWORD_HASHER_TOKEN, type PasswordHasher } from "../../domain/interfaces/password-hasher";
import { USER_REPOSITORY_TOKEN, type UserRepository } from "../../domain/interfaces/user-repository";
import { AuthResponseDto } from "../dtos/auth-response.dto";
import { LoginUserDto } from "../dtos/login-user.dto";


@Injectable()
export class LoginHandler {
    constructor(
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER_TOKEN) private readonly passwordHasher: PasswordHasher
    ) {
    }

    async handle(dto: LoginUserDto): Promise<AuthResponseDto> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (!existingUser) {
            throw new InvalidCredentialsException();
        }
        const passwordIsCorrect = await this.passwordHasher.compare(dto.password, existingUser.passwordHash);
        if (!passwordIsCorrect) {
            throw new InvalidCredentialsException();
        }
        return { user: { id: existingUser.id, username: existingUser.username, email: existingUser.email } };
    }

}
