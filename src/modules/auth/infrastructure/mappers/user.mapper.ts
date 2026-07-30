import { User as PrismaUser } from "src/generated/prisma/client";
import { User } from '../../domain/entities/user.entity';


export class UserMapper {
    static toDomain(raw: PrismaUser): User {
        return User.rehydrate({
            id: raw.id,
            username: raw.username,
            email: raw.email,
            passwordHash: raw.password_hash,
            refreshTokenHash: raw.refresh_token_hash ?? undefined,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
        });
    }

    static toPersistence(user: User) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            password_hash: user.passwordHash,
            refresh_token_hash: user.refreshTokenHash,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
        };
    }
}