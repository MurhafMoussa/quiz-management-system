import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from 'src/shared/domain/enums/role.enum';

export const ProfileResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studentIdCode: z.string().optional(),
  gradeLevel: z.string().optional(),
  interests: z.array(z.string()).optional(),
  major: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
  subjectSpecialties: z.array(z.string()).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  isVerified: z.boolean(),
  role: z.nativeEnum(Role),
  profile: ProfileResponseSchema.nullable().default(null),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserResponseSchema,
});

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
