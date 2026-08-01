import { createZodDto } from 'nestjs-zod';
import { BaseUserSchema } from './auth.schemas';

export class UserResponseDto extends createZodDto(BaseUserSchema) {}
