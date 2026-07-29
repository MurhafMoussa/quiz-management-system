
import { createZodDto } from 'nestjs-zod';
import { BaseUserSchema, passwordSchema } from './auth.schemas';
const LoginUserSchema = BaseUserSchema.omit({ id: true, username: true })
    .extend({
        password: passwordSchema,

    });
export class LoginUserDto extends createZodDto(LoginUserSchema) { }
