import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateStudentProfileSchema = z.object({
  studentIdCode: z
    .string({ error: 'validation.FIELD_REQUIRED' })
    .min(1, { error: 'validation.FIELD_REQUIRED' }),
  gradeLevel: z.string().optional(),
  interests: z.array(z.string()).optional().default([]),
  major: z.string().optional(),
});

export const UpdateStudentProfileSchema = z.object({
  gradeLevel: z.string().optional(),
  interests: z.array(z.string()).optional(),
  major: z.string().optional(),
});

export const StudentProfileResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studentIdCode: z.string(),
  gradeLevel: z.string().optional(),
  interests: z.array(z.string()),
  major: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class CreateStudentProfileDto extends createZodDto(
  CreateStudentProfileSchema,
) {}
export class UpdateStudentProfileDto extends createZodDto(
  UpdateStudentProfileSchema,
) {}
export class StudentProfileResponseDto extends createZodDto(
  StudentProfileResponseSchema,
) {}
