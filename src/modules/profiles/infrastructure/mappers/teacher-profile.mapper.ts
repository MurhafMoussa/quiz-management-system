import { TeacherProfile as PrismaTeacherProfile } from 'src/generated/prisma/client';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';

export class TeacherProfileMapper {
  static toDomain(raw: PrismaTeacherProfile): TeacherProfile {
    return TeacherProfile.rehydrate({
      id: raw.id,
      userId: raw.user_id,
      title: raw.title || undefined,
      bio: raw.bio || undefined,
      department: raw.department || undefined,
      subjectSpecialties: raw.subject_specialties || undefined,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(teacherProfile: TeacherProfile): PrismaTeacherProfile {
    return {
      id: teacherProfile.id,
      bio: teacherProfile.bio ?? null,
      department: teacherProfile.department ?? null,
      subject_specialties: teacherProfile.subjectSpecialties ?? [],
      title: teacherProfile.title ?? null,
      user_id: teacherProfile.userId,
      created_at: teacherProfile.createdAt,
      updated_at: teacherProfile.updatedAt,
    };
  }
}
