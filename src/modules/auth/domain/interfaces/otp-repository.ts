// modules/auth/domain/interfaces/otp-repository.port.ts
export const OTP_REPOSITORY_TOKEN = Symbol('OTP_REPOSITORY_TOKEN');

export interface OtpData {
  codeHash: string;
  attempts: number;
}

export interface OtpRepository {
  /**
   * Stores the OTP hash with a strict expiration time.
   */
  saveOtp(userId: string, codeHash: string, ttlSeconds: number): Promise<void>;

  /**
   * Retrieves active OTP data for the user.
   */
  getOtp(userId: string): Promise<OtpData | null>;

  /**
   * Increments the bad attempt counter. Returns updated count.
   */
  incrementAttempts(userId: string): Promise<number>;

  /**
   * Immediately deletes the OTP key upon successful verification.
   */
  deleteOtp(userId: string): Promise<void>;

  /**
   * Sets a resend cooldown lock for the user.
   */
  setCooldown(userId: string, ttlSeconds: number): Promise<void>;

  /**
   * Checks if user is currently under a resend cooldown.
   */
  hasCooldown(userId: string): Promise<boolean>;
}
