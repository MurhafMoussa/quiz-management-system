

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import * as constants from '../../domain/constants/validation-constants';
import { USERNAME_MAX_LENGTH } from '../../domain/constants/validation-constants';
const RegisterUserSchema = z.object({
    username: z.string({ error: "validation.FIELD_REQUIRED" })
        .min(constants.USERNAME_MIN_LENGTH, { error: "validation.MIN_LENGTH" })
        .max(USERNAME_MAX_LENGTH, { error: "validation.MAX_LENGTH" }),
    email: z.email({ error: "validation.FIELD_REQUIRED" }),
    password: z.string({ error: "validation.FIELD_REQUIRED" })
        .min(constants.PASSWORD_MIN_LENGTH, { error: "validation.MIN_LENGTH" })
        .max(constants.PASSWORD_MAX_LENGTH, { error: "validation.MAX_LENGTH" }),
    confirmPassword: z.string({ error: "validation.FIELD_REQUIRED" })
        .min(constants.PASSWORD_MIN_LENGTH, { error: "validation.MIN_LENGTH" })
        .max(constants.PASSWORD_MAX_LENGTH, { error: "validation.MAX_LENGTH" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'validation.PASSWORDS_DO_NOT_MATCH',
    path: ['confirmPassword'],
});
export class RegisterUserDto extends createZodDto(RegisterUserSchema) { }
