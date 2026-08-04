import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from 'src/shared/domain/enums/role.enum';
import { BaseUserSchema, passwordSchema } from './auth.schemas';

const RegisterUserSchema = BaseUserSchema.omit({
  id: true,
  isVerified: true,
  role: true,
})
  .extend({
    password: passwordSchema,
    confirmPassword: passwordSchema,
    role: z.nativeEnum(Role).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.PASSWORDS_DO_NOT_MATCH',
    path: ['confirmPassword'],
  });
export class RegisterUserDto extends createZodDto(RegisterUserSchema) {}
