import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/services/prisma.service';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';
import { ProfileRepository } from '../../domain/interfaces/profile-repository';
import { StudentProfileMapper } from '../mappers/student-profile.mapper';
import { TeacherProfileMapper } from '../mappers/teacher-profile.mapper';

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findTeacherProfileByUserId(
    userId: string,
  ): Promise<TeacherProfile | null> {
    const rawProfile = await this.prisma.teacherProfile.findUnique({
      where: { user_id: userId },
    });

    if (!rawProfile) {
      return null;
    }

    return TeacherProfileMapper.toDomain(rawProfile);
  }
  async saveTeacherProfile(profile: TeacherProfile): Promise<void> {
    const prismaProfile = TeacherProfileMapper.toPersistence(profile);
    await this.prisma.teacherProfile.upsert({
      where: { user_id: profile.userId },
      update: prismaProfile,
      create: prismaProfile,
    });
  }
  async findStudentProfileByUserId(
    userId: string,
  ): Promise<StudentProfile | null> {
    const rawProfile = await this.prisma.studentProfile.findUnique({
      where: { user_id: userId },
    });

    if (!rawProfile) {
      return null;
    }

    return StudentProfileMapper.toDomain(rawProfile);
  }

  async saveStudentProfile(profile: StudentProfile): Promise<void> {
    const prismaProfile = StudentProfileMapper.toPersistence(profile);
    await this.prisma.studentProfile.upsert({
      where: { user_id: profile.userId },
      update: prismaProfile,
      create: prismaProfile,
    });
  }
}
