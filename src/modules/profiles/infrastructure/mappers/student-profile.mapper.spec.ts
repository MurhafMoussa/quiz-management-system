import { StudentProfileMapper } from './student-profile.mapper';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { StudentProfile as PrismaStudentProfile } from 'src/generated/prisma/client';

describe('StudentProfileMapper', () => {
  const date = new Date('2025-01-01T00:00:00.000Z');

  const rawPrismaProfile: PrismaStudentProfile = {
    id: 'sp-1',
    user_id: 'user-1',
    student_id_code: 'STU101',
    grade_level: 'Grade 10',
    interests: ['Math', 'Coding'],
    major: 'Computer Science',
    created_at: date,
    updated_at: date,
  };

  it('should map Prisma student profile to domain entity (toDomain)', () => {
    const domainProfile = StudentProfileMapper.toDomain(rawPrismaProfile);

    expect(domainProfile).toBeInstanceOf(StudentProfile);
    expect(domainProfile.id).toBe('sp-1');
    expect(domainProfile.userId).toBe('user-1');
    expect(domainProfile.studentIdCode).toBe('STU101');
    expect(domainProfile.gradeLevel).toBe('Grade 10');
    expect(domainProfile.interests).toEqual(['Math', 'Coding']);
    expect(domainProfile.major).toBe('Computer Science');
  });

  it('should map domain entity to Prisma persistence object (toPersistence)', () => {
    const domainProfile = StudentProfile.rehydrate({
      id: 'sp-1',
      userId: 'user-1',
      studentIdCode: 'STU101',
      gradeLevel: 'Grade 10',
      interests: ['Math', 'Coding'],
      major: 'Computer Science',
      createdAt: date,
      updatedAt: date,
    });

    const persistence = StudentProfileMapper.toPersistence(domainProfile);

    expect(persistence).toEqual({
      id: 'sp-1',
      user_id: 'user-1',
      student_id_code: 'STU101',
      grade_level: 'Grade 10',
      interests: ['Math', 'Coding'],
      major: 'Computer Science',
      created_at: date,
      updated_at: date,
    });
  });
});
