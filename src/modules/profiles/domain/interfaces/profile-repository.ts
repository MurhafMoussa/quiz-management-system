import { StudentProfile } from '../entities/student-profile.entity';
import { TeacherProfile } from '../entities/teacher-profile.entity';

export const PROFILE_REPOSITORY_TOKEN = Symbol('ProfileRepository');
export interface ProfileRepository {
  findTeacherProfileByUserId(userId: string): Promise<TeacherProfile | null>;
  saveTeacherProfile(profile: TeacherProfile): Promise<void>;
  findStudentProfileByUserId(userId: string): Promise<StudentProfile | null>;
  saveStudentProfile(profile: StudentProfile): Promise<void>;
}
