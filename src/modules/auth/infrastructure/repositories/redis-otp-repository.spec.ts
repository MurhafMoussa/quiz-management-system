import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { RedisOtpRepository } from './redis-otp-repository';
import { OtpData } from '../../domain/interfaces/otp-repository';

describe('RedisOtpRepository', () => {
  let repository: RedisOtpRepository;
  let cacheManagerMock: jest.Mocked<Cache>;

  beforeEach(async () => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisOtpRepository,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    repository = module.get<RedisOtpRepository>(RedisOtpRepository);
  });

  it('should save OTP with TTL in milliseconds', async () => {
    const userId = 'user-1';
    const codeHash = 'hashed_otp_123';
    const ttlSeconds = 300;

    await repository.saveOtp(userId, codeHash, ttlSeconds);

    expect(cacheManagerMock.set).toHaveBeenCalledWith(
      'otp:user:user-1',
      { codeHash: 'hashed_otp_123', attempts: 0 },
      300000,
    );
  });

  it('should get OTP data when present', async () => {
    const otpData: OtpData = { codeHash: 'hashed_otp_123', attempts: 1 };
    cacheManagerMock.get.mockResolvedValue(otpData);

    const result = await repository.getOtp('user-1');

    expect(cacheManagerMock.get).toHaveBeenCalledWith('otp:user:user-1');
    expect(result).toEqual(otpData);
  });

  it('should return null when OTP is not found', async () => {
    cacheManagerMock.get.mockResolvedValue(undefined);

    const result = await repository.getOtp('user-1');

    expect(result).toBeNull();
  });

  it('should increment attempts and save updated data', async () => {
    const otpData: OtpData = { codeHash: 'hashed_otp_123', attempts: 1 };
    cacheManagerMock.get.mockResolvedValue(otpData);

    const updatedAttempts = await repository.incrementAttempts('user-1');

    expect(updatedAttempts).toBe(2);
    expect(cacheManagerMock.set).toHaveBeenCalledWith('otp:user:user-1', {
      codeHash: 'hashed_otp_123',
      attempts: 2,
    });
  });

  it('should return 0 on incrementAttempts if OTP does not exist', async () => {
    cacheManagerMock.get.mockResolvedValue(undefined);

    const updatedAttempts = await repository.incrementAttempts('user-1');

    expect(updatedAttempts).toBe(0);
    expect(cacheManagerMock.set).not.toHaveBeenCalled();
  });

  it('should delete OTP key', async () => {
    await repository.deleteOtp('user-1');

    expect(cacheManagerMock.del).toHaveBeenCalledWith('otp:user:user-1');
  });

  it('should set cooldown key with TTL in milliseconds', async () => {
    await repository.setCooldown('user-1', 60);

    expect(cacheManagerMock.set).toHaveBeenCalledWith(
      'otp_cooldown:user:user-1',
      true,
      60000,
    );
  });

  it('should return true when cooldown exists', async () => {
    cacheManagerMock.get.mockResolvedValue(true);

    const hasCooldown = await repository.hasCooldown('user-1');

    expect(cacheManagerMock.get).toHaveBeenCalledWith(
      'otp_cooldown:user:user-1',
    );
    expect(hasCooldown).toBe(true);
  });

  it('should return false when cooldown does not exist', async () => {
    cacheManagerMock.get.mockResolvedValue(undefined);

    const hasCooldown = await repository.hasCooldown('user-1');

    expect(hasCooldown).toBe(false);
  });
});
