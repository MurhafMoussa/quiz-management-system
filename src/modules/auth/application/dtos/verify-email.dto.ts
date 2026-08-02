import { createZodDto } from 'nestjs-zod';
import { verifyEmailSchema } from './auth.schemas';

export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}
