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
import {
  PROFILE_REPOSITORY_TOKEN,
  ProfileRepository,
} from '../src/modules/profiles/domain/interfaces/profile-repository';
import { StudentProfile } from '../src/modules/profiles/domain/entities/student-profile.entity';
import { TeacherProfile } from '../src/modules/profiles/domain/entities/teacher-profile.entity';

describe('Profiles Endpoints (e2e)', () => {
  let app: INestApplication;
  const inMemoryUsers: Map<string, User> = new Map();
  const inMemoryStudentProfiles: Map<string, StudentProfile> = new Map();
  const inMemoryTeacherProfiles: Map<string, TeacherProfile> = new Map();

  const mockUserRepository: UserRepository = {
    async findByEmail(email: string): Promise<User | null> {
      for (const user of inMemoryUsers.values()) {
        if (user.email === email) return user;
      }
      return null;
    },
    async findById(id: string): Promise<User | null> {
      const user = inMemoryUsers.get(id);
      if (user) {
        const studentProfile = inMemoryStudentProfiles.get(id);
        const teacherProfile = inMemoryTeacherProfiles.get(id);
        if (studentProfile) {
          user.profile = {
            id: studentProfile.id,
            userId: studentProfile.userId,
            studentIdCode: studentProfile.studentIdCode,
            gradeLevel: studentProfile.gradeLevel,
            interests: studentProfile.interests,
            major: studentProfile.major,
            createdAt: studentProfile.createdAt,
            updatedAt: studentProfile.updatedAt,
          };
        } else if (teacherProfile) {
          user.profile = {
            id: teacherProfile.id,
            userId: teacherProfile.userId,
            title: teacherProfile.title,
            bio: teacherProfile.bio,
            department: teacherProfile.department,
            subjectSpecialties: teacherProfile.subjectSpecialties,
            createdAt: teacherProfile.createdAt,
            updatedAt: teacherProfile.updatedAt,
          };
        } else {
          user.profile = null;
        }
      }
      return user || null;
    },
    async save(user: User): Promise<User> {
      inMemoryUsers.set(user.id, user);
      return user;
    },
  };

  const mockProfileRepository: ProfileRepository = {
    async findTeacherProfileByUserId(
      userId: string,
    ): Promise<TeacherProfile | null> {
      return inMemoryTeacherProfiles.get(userId) || null;
    },
    async saveTeacherProfile(profile: TeacherProfile): Promise<void> {
      inMemoryTeacherProfiles.set(profile.userId, profile);
    },
    async findStudentProfileByUserId(
      userId: string,
    ): Promise<StudentProfile | null> {
      return inMemoryStudentProfiles.get(userId) || null;
    },
    async saveStudentProfile(profile: StudentProfile): Promise<void> {
      inMemoryStudentProfiles.set(profile.userId, profile);
    },
  };

  const mockPrismaService = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
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
      .overrideProvider(PROFILE_REPOSITORY_TOKEN)
      .useValue(mockProfileRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    inMemoryUsers.clear();
    inMemoryStudentProfiles.clear();
    inMemoryTeacherProfiles.clear();
  });

  async function registerUser(): Promise<{
    accessToken: string;
    userId: string;
  }> {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    return {
      accessToken: registerRes.body.data.accessToken,
      userId: registerRes.body.data.user.id,
    };
  }

  describe('GET /profiles/me', () => {
    it('should return 200 with the core user data and profile as null if profile does not exist', async () => {
      const { accessToken, userId } = await registerUser();

      const response = await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.profile).toBeNull();
    });

    it('should return 200 with user and student profile details if user has student profile', async () => {
      const { accessToken, userId } = await registerUser();

      const profile = StudentProfile.create({
        id: 'sp-1',
        userId,
        studentIdCode: 'STU123',
        gradeLevel: 'Junior',
        interests: ['Math'],
        major: 'Math',
      });
      await mockProfileRepository.saveStudentProfile(profile);

      const response = await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.profile.studentIdCode).toBe('STU123');
    });
  });

  describe('POST /profiles/student', () => {
    it('should successfully create student profile and return 201', async () => {
      const { accessToken } = await registerUser();

      const response = await request(app.getHttpServer())
        .post('/profiles/student')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          studentIdCode: 'STU123',
          gradeLevel: 'Junior',
          interests: ['Programming'],
          major: 'CS',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.studentIdCode).toBe('STU123');
    });
  });
});
