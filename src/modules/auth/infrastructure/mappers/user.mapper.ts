import {
  User as PrismaUser,
  Role as PrismaRole,
} from 'src/generated/prisma/client';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/role.enum';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.rehydrate({
      id: raw.id,
      firstName: raw.first_name,
      lastName: raw.last_name,
      email: raw.email,
      passwordHash: raw.password_hash,
      refreshTokenHash: raw.refresh_token_hash ?? undefined,
      isVerified: raw.is_verified,
      role: raw.role as unknown as Role,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      password_hash: user.passwordHash,
      refresh_token_hash: user.refreshTokenHash,
      is_verified: user.isVerified,
      role: user.role as unknown as PrismaRole,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
