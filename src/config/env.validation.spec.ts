import { validate } from './env.validation';

describe('env.validation', () => {
  it('should validate valid environment configuration', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: '3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_ACCESS_TOKEN_SECRET: 'accessSecret123',
      JWT_REFRESH_TOKEN_SECRET: 'refreshSecret123',
      JWT_ACCESS_TOKEN_EXPIRATION_MS: '3600000',
      JWT_REFRESH_TOKEN_EXPIRATION_MS: '86400000',
    };

    const result = validate(validConfig);
    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe('development');
    expect(result.REDIS_HOST).toBe('localhost');
    expect(result.REDIS_PORT).toBe(6379);
  });

  it('should throw Error on invalid environment configuration', () => {
    const invalidConfig = {
      PORT: 'invalid_port',
    };

    expect(() => validate(invalidConfig)).toThrow('Config validation error');
  });
});
