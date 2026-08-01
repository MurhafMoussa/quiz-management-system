import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number(),
  DATABASE_URL: z.url(),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(8),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(8),
  JWT_ACCESS_TOKEN_EXPIRATION_MS: z.string(),
  JWT_REFRESH_TOKEN_EXPIRATION_MS: z.string(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

// Extract the inferred TypeScript type from the schema
export type EnvironmentVariables = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (result.success === false) {
    throw new Error(`Config validation error: ${result.error.toString()}`);
  }

  return result.data;
}
