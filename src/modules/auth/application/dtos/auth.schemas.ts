import * as constants from 'src/shared/domain/constants/validation-constants';
import { z } from 'zod';
import { Role } from '../../domain/enums/role.enum';

export const usernameSchema = z
  .string({ error: 'validation.FIELD_REQUIRED' })
  .min(constants.USERNAME_MIN_LENGTH, { error: 'validation.MIN_LENGTH' })
  .max(constants.USERNAME_MAX_LENGTH, { error: 'validation.MAX_LENGTH' });

export const emailSchema = z
  .string({ error: 'validation.FIELD_REQUIRED' })
  .email({ error: 'validation.INVALID_EMAIL' });

export const passwordSchema = z
  .string({ error: 'validation.FIELD_REQUIRED' })
  .min(constants.PASSWORD_MIN_LENGTH, { error: 'validation.MIN_LENGTH' })
  .max(constants.PASSWORD_MAX_LENGTH, { error: 'validation.MAX_LENGTH' });

export const BaseUserSchema = z.object({
  id: z.uuid(),
  firstName: usernameSchema,
  lastName: usernameSchema,
  email: emailSchema,
  isVerified: z.boolean(),
  role: z.nativeEnum(Role),
});

export const verifyEmailSchema = z.object({
  userId: z.uuid({ error: 'validation.INVALID_UUID' }),
  code: z
    .string({ error: 'validation.FIELD_REQUIRED' })
    .length(6, { error: 'validation.INVALID_CODE_LENGTH' }),
});
