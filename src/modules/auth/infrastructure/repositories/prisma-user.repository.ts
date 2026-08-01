import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/services/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user-repository';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(userId: string): Promise<User | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!rawUser) return null;

    return UserMapper.toDomain(rawUser);
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

    const savedUser = await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: data,
    });

    return UserMapper.toDomain(savedUser);
  }
}
