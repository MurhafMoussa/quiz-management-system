import { Inject, Injectable } from "@nestjs/common";
import { ID_GENERATOR_TOKEN, type IdGenerator } from "src/shared/domain/interfaces/id-generator"; 
import { User } from "../../domain/entities/user.entity";
import { UserAlreadyExistException } from "../../domain/exceptions/user-already-exist.exception";
import { PASSWORD_HASHER_TOKEN, type PasswordHasher } from "../../domain/interfaces/password-hasher";
import { USER_REPOSITORY_TOKEN, type UserRepository } from "../../domain/interfaces/user-repository";
import { RegisterUserDto } from "../dtos/register-user.dto";


@Injectable()
export class RegisterHandler {
    constructor(
        @Inject(ID_GENERATOR_TOKEN) private readonly idGenerator: IdGenerator,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER_TOKEN) private readonly passwordHasher: PasswordHasher
    ) {
    }

    async handle(dto: RegisterUserDto): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new UserAlreadyExistException(dto.email);
        }
        const passwordHash = await this.passwordHasher.hash(dto.password);
        const id = this.idGenerator.generate();
        const user = User.create({
            id,
            username: dto.username,
            email: dto.email,
            passwordHash,
        });
       return await this.userRepository.save(user)
    }

}
