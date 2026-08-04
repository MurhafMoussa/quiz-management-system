import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from 'src/shared/infrastructure/services/prisma.service';
import { User } from '../../domain/entities/user.entity';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      upsert: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
  });

  it('should find user by id and return domain entity', async () => {
    const rawUser = {
      id: 'u-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password_hash: 'passHash',
      refresh_token_hash: 'refHash',
      created_at: new Date(),
      updated_at: new Date(),
    };
    prismaService.user.findUnique.mockResolvedValue(rawUser);

    const result = await repository.findById('u-1');

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      include: { StudentProfile: true, TeacherProfile: true },
    });
    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe('u-1');
  });

  it('should return null when findById finds no user', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);

    const result = await repository.findById('nonexistent');
    expect(result).toBeNull();
  });

  it('should find user by email and return domain entity', async () => {
    const rawUser = {
      id: 'u-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password_hash: 'passHash',
      refresh_token_hash: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    prismaService.user.findUnique.mockResolvedValue(rawUser);

    const result = await repository.findByEmail('john@example.com');

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
      include: { StudentProfile: true, TeacherProfile: true },
    });
    expect(result).toBeInstanceOf(User);
  });

  it('should save domain user to database and return saved domain entity', async () => {
    const domainUser = User.create({
      id: 'u-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: 'passHash',
      refreshTokenHash: 'refHash',
    });

    const rawSavedUser = {
      id: domainUser.id,
      first_name: domainUser.firstName,
      last_name: domainUser.lastName,
      email: domainUser.email,
      password_hash: domainUser.passwordHash,
      refresh_token_hash: domainUser.refreshTokenHash,
      is_verified: domainUser.isVerified,
      role: domainUser.role,
      created_at: domainUser.createdAt,
      updated_at: domainUser.updatedAt,
    };

    prismaService.user.upsert.mockResolvedValue(rawSavedUser);

    const result = await repository.save(domainUser);

    expect(prismaService.user.upsert).toHaveBeenCalledWith({
      where: { id: domainUser.id },
      create: expect.any(Object),
      update: expect.any(Object),
      include: { StudentProfile: true, TeacherProfile: true },
    });
    expect(result).toBeInstanceOf(User);
    expect(result.id).toBe('u-1');
  });
});
