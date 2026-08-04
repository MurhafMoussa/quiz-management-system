import { StudentProfile as PrismaStudentProfile } from 'src/generated/prisma/client';
import { StudentProfile } from '../../domain/entities/student-profile.entity';

export class StudentProfileMapper {
  static toDomain(raw: PrismaStudentProfile): StudentProfile {
    return StudentProfile.rehydrate({
      id: raw.id,
      userId: raw.user_id,
      studentIdCode: raw.student_id_code,
      gradeLevel: raw.grade_level || undefined,
      interests: raw.interests || undefined,
      major: raw.major || undefined,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(studentProfile: StudentProfile): PrismaStudentProfile {
    return {
      id: studentProfile.id,
      student_id_code: studentProfile.studentIdCode,
      grade_level: studentProfile.gradeLevel ?? null,
      interests: studentProfile.interests ?? [],
      major: studentProfile.major ?? null,
      user_id: studentProfile.userId,
      created_at: studentProfile.createdAt,
      updated_at: studentProfile.updatedAt,
    };
  }
}
