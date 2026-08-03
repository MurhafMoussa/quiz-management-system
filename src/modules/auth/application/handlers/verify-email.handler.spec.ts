import { Test, TestingModule } from '@nestjs/testing';
import { InvalidOtpCodeException } from '../../domain/exceptions/invalid-otp-code.exception';
import { OtpExpiredOrInvalidException } from '../../domain/exceptions/otp-expired-or-invalid.exception';
import { TooManyOtpAttemptsException } from '../../domain/exceptions/too-many-otp-attempts.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { HASHER_TOKEN } from '../../domain/interfaces/hasher';
import { OTP_REPOSITORY_TOKEN } from '../../domain/interfaces/otp-repository';
import { USER_REPOSITORY_TOKEN } from '../../domain/interfaces/user-repository';
import { User } from '../../domain/entities/user.entity';
import { VerifyEmailHandler } from './verify-email.handler';

describe('VerifyEmailHandler', () => {
  let handler: VerifyEmailHandler;
  let otpRepoMock: any;
  let userRepoMock: any;
  let hasherMock: any;

  beforeEach(async () => {
    otpRepoMock = {
      getOtp: jest.fn(),
      incrementAttempts: jest.fn(),
      deleteOtp: jest.fn().mockResolvedValue(undefined),
    };

    userRepoMock = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    hasherMock = {
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyEmailHandler,
        { provide: OTP_REPOSITORY_TOKEN, useValue: otpRepoMock },
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepoMock },
        { provide: HASHER_TOKEN, useValue: hasherMock },
      ],
    }).compile();

    handler = module.get<VerifyEmailHandler>(VerifyEmailHandler);
  });

  it('should throw OtpExpiredOrInvalidException when OTP data is missing', async () => {
    otpRepoMock.getOtp.mockResolvedValue(null);

    await expect(handler.execute('user-123', '123456')).rejects.toThrow(
      OtpExpiredOrInvalidException,
    );
  });

  it('should throw TooManyOtpAttemptsException and delete OTP if attempts >= MAX_OTP_ATTEMPTS', async () => {
    otpRepoMock.getOtp.mockResolvedValue({
      codeHash: 'hash123',
      attempts: 5,
    });

    await expect(handler.execute('user-123', '123456')).rejects.toThrow(
      TooManyOtpAttemptsException,
    );
    expect(otpRepoMock.deleteOtp).toHaveBeenCalledWith('user-123');
  });

  it('should increment attempts and throw InvalidOtpCodeException on invalid code', async () => {
    otpRepoMock.getOtp.mockResolvedValue({
      codeHash: 'hash123',
      attempts: 0,
    });
    hasherMock.compare.mockResolvedValue(false);
    otpRepoMock.incrementAttempts.mockResolvedValue(1);

    await expect(handler.execute('user-123', '999999')).rejects.toThrow(
      InvalidOtpCodeException,
    );
    expect(otpRepoMock.incrementAttempts).toHaveBeenCalledWith('user-123');
  });

  it('should throw TooManyOtpAttemptsException if incremented attempts reach max', async () => {
    otpRepoMock.getOtp.mockResolvedValue({
      codeHash: 'hash123',
      attempts: 4,
    });
    hasherMock.compare.mockResolvedValue(false);
    otpRepoMock.incrementAttempts.mockResolvedValue(5);

    await expect(handler.execute('user-123', '999999')).rejects.toThrow(
      TooManyOtpAttemptsException,
    );
    expect(otpRepoMock.deleteOtp).toHaveBeenCalledWith('user-123');
  });

  it('should throw UserNotFoundException if user entity is not found in repository', async () => {
    otpRepoMock.getOtp.mockResolvedValue({
      codeHash: 'hash123',
      attempts: 0,
    });
    hasherMock.compare.mockResolvedValue(true);
    userRepoMock.findById.mockResolvedValue(null);

    await expect(handler.execute('user-123', '123456')).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('should mark user as verified, save user, and delete OTP on success', async () => {
    const user = User.create({
      id: 'user-123',
      username: 'john',
      email: 'john@example.com',
      passwordHash: 'passhash',
      refreshTokenHash: undefined,
    });

    otpRepoMock.getOtp.mockResolvedValue({
      codeHash: 'hash123',
      attempts: 0,
    });
    hasherMock.compare.mockResolvedValue(true);
    userRepoMock.findById.mockResolvedValue(user);

    await handler.execute('user-123', '123456');

    expect(user.isVerified).toBe(true);
    expect(userRepoMock.save).toHaveBeenCalledWith(user);
    expect(otpRepoMock.deleteOtp).toHaveBeenCalledWith('user-123');
  });
});
