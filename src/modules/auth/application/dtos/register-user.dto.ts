import { createZodDto } from 'nestjs-zod';
import { BaseUserSchema, passwordSchema } from './auth.schemas';
const RegisterUserSchema = BaseUserSchema.omit({ id: true, isVerified: true })
  .extend({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.PASSWORDS_DO_NOT_MATCH',
    path: ['confirmPassword'],
  });
export class RegisterUserDto extends createZodDto(RegisterUserSchema) {}
