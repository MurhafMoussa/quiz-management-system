import { PrismaService } from './prisma.service';

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({
    name: '@prisma/adapter-pg',
    adapterName: '@prisma/adapter-pg',
    provider: 'postgres',
    executeRaw: jest.fn(),
    queryRaw: jest.fn(),
  })),
}));

describe('PrismaService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw an error if DATABASE_URL environment variable is missing', () => {
    delete process.env.DATABASE_URL;
    expect(() => new PrismaService()).toThrow('DATABASE_URL environment variable is missing.');
  });

  it('should call $connect on module init and $disconnect on module destroy', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    
    // Test methods on prototype safely without triggering Prisma engine initialization
    const onModuleInitSpy = jest.spyOn(PrismaService.prototype, '$connect').mockResolvedValue(undefined as never);
    const onModuleDestroySpy = jest.spyOn(PrismaService.prototype, '$disconnect').mockResolvedValue(undefined as never);

    const service = Object.create(PrismaService.prototype);

    await service.onModuleInit();
    expect(onModuleInitSpy).toHaveBeenCalled();

    await service.onModuleDestroy();
    expect(onModuleDestroySpy).toHaveBeenCalled();
  });
});
