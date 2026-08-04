import { createZodDto } from 'nestjs-zod';
import { BaseUserSchema, passwordSchema } from './auth.schemas';
const LoginUserSchema = BaseUserSchema.omit({
  id: true,
  firstName: true,
  lastName: true,
  isVerified: true,
  role: true,
}).extend({
  password: passwordSchema,
});
export class LoginUserDto extends createZodDto(LoginUserSchema) {}
