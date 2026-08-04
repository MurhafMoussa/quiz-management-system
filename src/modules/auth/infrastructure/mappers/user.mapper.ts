import {
  User as PrismaUser,
  Role as PrismaRole,
} from 'src/generated/prisma/client';
import { User } from '../../domain/entities/user.entity';
import { Role } from 'src/shared/domain/enums/role.enum';
import { UserResponseDto } from 'src/shared/application/dtos/user-response.dto';

interface RawStudentProfile {
  id: string;
  user_id: string;
  student_id_code: string;
  grade_level: string | null;
  interests: string[];
  major: string | null;
  created_at: Date;
  updated_at: Date;
}

interface RawTeacherProfile {
  id: string;
  user_id: string;
  title: string | null;
  bio: string | null;
  department: string | null;
  subject_specialties: string[];
  created_at: Date;
  updated_at: Date;
}

interface RawUserWithProfiles extends PrismaUser {
  StudentProfile?: RawStudentProfile | null;
  TeacherProfile?: RawTeacherProfile | null;
}

export class UserMapper {
  static toResponse(user: User, profile: any = null): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      profile: (user.profile ?? profile ?? null) as UserResponseDto['profile'],
    };
  }

  static toDomain(raw: RawUserWithProfiles): User {
    const user = User.rehydrate({
      id: raw.id,
      firstName: raw.first_name,
      lastName: raw.last_name,
      email: raw.email,
      passwordHash: raw.password_hash,
      refreshTokenHash: raw.refresh_token_hash ?? undefined,
      isVerified: raw.is_verified,
      role: raw.role as unknown as Role,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });

    if (raw.StudentProfile) {
      user.profile = {
        id: raw.StudentProfile.id,
        userId: raw.StudentProfile.user_id,
        studentIdCode: raw.StudentProfile.student_id_code,
        gradeLevel: raw.StudentProfile.grade_level ?? undefined,
        interests: raw.StudentProfile.interests,
        major: raw.StudentProfile.major ?? undefined,
        createdAt: raw.StudentProfile.created_at,
        updatedAt: raw.StudentProfile.updated_at,
      };
    } else if (raw.TeacherProfile) {
      user.profile = {
        id: raw.TeacherProfile.id,
        userId: raw.TeacherProfile.user_id,
        title: raw.TeacherProfile.title ?? undefined,
        bio: raw.TeacherProfile.bio ?? undefined,
        department: raw.TeacherProfile.department ?? undefined,
        subjectSpecialties: raw.TeacherProfile.subject_specialties,
        createdAt: raw.TeacherProfile.created_at,
        updatedAt: raw.TeacherProfile.updated_at,
      };
    }

    return user;
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      password_hash: user.passwordHash,
      refresh_token_hash: user.refreshTokenHash,
      is_verified: user.isVerified,
      role: user.role as unknown as PrismaRole,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
