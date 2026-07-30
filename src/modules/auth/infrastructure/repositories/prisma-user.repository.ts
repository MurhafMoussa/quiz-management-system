import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/services/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user-repository';
import { UserMapper } from '../mappers/user.mapper';


@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) { }
    async updateRefreshTokenHash(refreshTokenHash: string, userId: string): Promise<void> {
        this.prisma.user.update({
            where: { id: userId },
            data: { refresh_token_hash: refreshTokenHash }
        })
    }

    async findByEmail(email: string): Promise<User | null> {
        const rawUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!rawUser) return null;

        return UserMapper.toDomain(rawUser);
    }

    async save(user: User): Promise<User> {
        const data = UserMapper.toPersistence(user);

        const savedUser = await this.prisma.user.create({ data });

        return UserMapper.toDomain(savedUser);
    }
}