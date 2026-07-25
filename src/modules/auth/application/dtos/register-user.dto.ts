

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
const RegisterUserSchema = z.object({
    username: z.string().min(3).max(20).trim(),
    email: z.email().trim(),
    password: z.string().min(6).max(100).trim(),
    confirmPassword: z.string().min(6).max(100).trim(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
});
export class RegisterUserDto extends createZodDto(RegisterUserSchema) { }
