import { TeacherProfileMapper } from './teacher-profile.mapper';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';
import { TeacherProfile as PrismaTeacherProfile } from 'src/generated/prisma/client';

describe('TeacherProfileMapper', () => {
  const date = new Date('2025-01-01T00:00:00.000Z');

  const rawPrismaProfile: PrismaTeacherProfile = {
    id: 'tp-1',
    user_id: 'user-2',
    title: 'Dr.',
    bio: 'Physics Professor',
    department: 'Science',
    subject_specialties: ['Physics'],
    created_at: date,
    updated_at: date,
  };

  it('should map Prisma teacher profile to domain entity (toDomain)', () => {
    const domainProfile = TeacherProfileMapper.toDomain(rawPrismaProfile);

    expect(domainProfile).toBeInstanceOf(TeacherProfile);
    expect(domainProfile.id).toBe('tp-1');
    expect(domainProfile.userId).toBe('user-2');
    expect(domainProfile.title).toBe('Dr.');
    expect(domainProfile.bio).toBe('Physics Professor');
    expect(domainProfile.department).toBe('Science');
    expect(domainProfile.subjectSpecialties).toEqual(['Physics']);
  });

  it('should map domain entity to Prisma persistence object (toPersistence)', () => {
    const domainProfile = TeacherProfile.rehydrate({
      id: 'tp-1',
      userId: 'user-2',
      title: 'Dr.',
      bio: 'Physics Professor',
      department: 'Science',
      subjectSpecialties: ['Physics'],
      createdAt: date,
      updatedAt: date,
    });

    const persistence = TeacherProfileMapper.toPersistence(domainProfile);

    expect(persistence).toEqual({
      id: 'tp-1',
      user_id: 'user-2',
      title: 'Dr.',
      bio: 'Physics Professor',
      department: 'Science',
      subject_specialties: ['Physics'],
      created_at: date,
      updated_at: date,
    });
  });
});
