import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTeacherProfileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
  subjectSpecialties: z.array(z.string()).optional(),
});

export const UpdateTeacherProfileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
  subjectSpecialties: z.array(z.string()).optional(),
});

export const TeacherProfileResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
  subjectSpecialties: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class CreateTeacherProfileDto extends createZodDto(
  CreateTeacherProfileSchema,
) {}
export class UpdateTeacherProfileDto extends createZodDto(
  UpdateTeacherProfileSchema,
) {}
export class TeacherProfileResponseDto extends createZodDto(
  TeacherProfileResponseSchema,
) {}
