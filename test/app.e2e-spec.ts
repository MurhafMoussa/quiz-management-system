import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/services/prisma.service';

describe('App Bootstrap (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test_db';
    process.env.JWT_ACCESS_TOKEN_SECRET = 'super-secret-access-token-key-12345';
    process.env.JWT_REFRESH_TOKEN_SECRET = 'super-secret-refresh-token-key-12345';
    process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS = '3600000';
    process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS = '86400000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should initialize the application module without errors', () => {
    expect(app).toBeDefined();
  });
});
