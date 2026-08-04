import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../src/modules/auth/domain/interfaces/user-repository';
import { User } from '../src/modules/auth/domain/entities/user.entity';
import { PrismaService } from '../src/shared/infrastructure/services/prisma.service';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  const inMemoryUsers: Map<string, User> = new Map();

  const mockUserRepository: UserRepository = {
    async findByEmail(email: string): Promise<User | null> {
      for (const user of inMemoryUsers.values()) {
        if (user.email === email) return user;
      }
      return null;
    },
    async findById(id: string): Promise<User | null> {
      return inMemoryUsers.get(id) || null;
    },
    async save(user: User): Promise<User> {
      inMemoryUsers.set(user.id, user);
      return user;
    },
  };

  const mockPrismaService = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    // Set required environment variables for ConfigModule validation
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test_db';
    process.env.JWT_ACCESS_TOKEN_SECRET = 'super-secret-access-token-key-12345';
    process.env.JWT_REFRESH_TOKEN_SECRET =
      'super-secret-refresh-token-key-12345';
    process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS = '3600000';
    process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS = '86400000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(USER_REPOSITORY_TOKEN)
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    inMemoryUsers.clear();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully and return 201 Created envelope', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        statusCode: 201,
        message: expect.any(String),
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: {
            id: expect.any(String),
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            isVerified: false,
            role: 'STUDENT',
            profile: null,
          },
        },
      });
    });

    it('should fail with 400 Bad Request if validation rules fail (passwords mismatch)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'confirmPassword',
          }),
        ]),
      );
    });

    it('should fail with 400 Bad Request if user email already exists', async () => {
      const registerPayload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      // Register once
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload);

      // Register again with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials and return tokens', async () => {
      // 1. Register user
      await request(app.getHttpServer()).post('/auth/register').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      // Verify user
      const userToVerify =
        await mockUserRepository.findByEmail('john@example.com');
      if (userToVerify) {
        userToVerify.markAsVerified();
        await mockUserRepository.save(userToVerify);
      }

      // 2. Login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should fail with 400 Bad Request if password is incorrect', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      const userToVerify =
        await mockUserRepository.findByEmail('john@example.com');
      if (userToVerify) {
        userToVerify.markAsVerified();
        await mockUserRepository.save(userToVerify);
      }

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /profiles/me', () => {
    it('should return user profile when valid Bearer token is provided', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      const accessToken = registerRes.body.data.accessToken;

      const profileRes = await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data).toEqual({
        id: expect.any(String),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isVerified: false,
        role: 'STUDENT',
        profile: null,
      });
    });

    it('should fail with 401 Unauthorized when no authorization header is present', async () => {
      const response = await request(app.getHttpServer()).get('/profiles/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access and refresh tokens successfully', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      const refreshToken = loginRes.body.data.refreshToken;

      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();
    });
  });
});
