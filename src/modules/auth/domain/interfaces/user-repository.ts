import { User } from "../entities/user.entity";

export const USER_REPOSITORY_TOKEN = Symbol('UserRepository');
export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    updateRefreshTokenHash(refreshTokenHash: string,userId:string): Promise<void>;
    save(user: User): Promise<User>;
}