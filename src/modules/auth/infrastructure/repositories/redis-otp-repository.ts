import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { OtpData, OtpRepository } from '../../domain/interfaces/otp-repository';

@Injectable()
export class RedisOtpRepository implements OtpRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private getOtpKey(userId: string): string {
    return `otp:user:${userId}`;
  }

  private getCooldownKey(userId: string): string {
    return `otp_cooldown:user:${userId}`;
  }

  async saveOtp(
    userId: string,
    codeHash: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = this.getOtpKey(userId);
    const data: OtpData = { codeHash, attempts: 0 };

    await this.cacheManager.set(key, data, ttlSeconds * 1000);
  }

  async getOtp(userId: string): Promise<OtpData | null> {
    const key = this.getOtpKey(userId);
    const data = await this.cacheManager.get<OtpData>(key);
    return data ?? null;
  }

  async incrementAttempts(userId: string): Promise<number> {
    const key = this.getOtpKey(userId);
    const data = await this.getOtp(userId);
    if (!data) return 0;

    data.attempts += 1;

    await this.cacheManager.set(key, data);
    return data.attempts;
  }

  async deleteOtp(userId: string): Promise<void> {
    await this.cacheManager.del(this.getOtpKey(userId));
  }

  async setCooldown(userId: string, ttlSeconds: number): Promise<void> {
    await this.cacheManager.set(
      this.getCooldownKey(userId),
      true,
      ttlSeconds * 1000,
    );
  }

  async hasCooldown(userId: string): Promise<boolean> {
    const exists = await this.cacheManager.get<boolean>(
      this.getCooldownKey(userId),
    );
    return Boolean(exists);
  }
}
