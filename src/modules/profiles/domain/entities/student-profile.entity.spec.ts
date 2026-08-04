import { StudentProfile } from './student-profile.entity';

describe('StudentProfile Entity', () => {
  it('should create a new student profile and set timestamps', () => {
    const profile = StudentProfile.create({
      id: 'sp-1',
      userId: 'user-1',
      studentIdCode: 'STU1001',
      gradeLevel: 'Grade 10',
      interests: ['Math', 'Science'],
      major: 'Computer Science',
    });

    expect(profile.id).toBe('sp-1');
    expect(profile.userId).toBe('user-1');
    expect(profile.studentIdCode).toBe('STU1001');
    expect(profile.gradeLevel).toBe('Grade 10');
    expect(profile.interests).toEqual(['Math', 'Science']);
    expect(profile.major).toBe('Computer Science');
    expect(profile.createdAt).toBeInstanceOf(Date);
    expect(profile.updatedAt).toBeInstanceOf(Date);
  });

  it('should update profile fields and touch updatedAt', () => {
    const profile = StudentProfile.create({
      id: 'sp-1',
      userId: 'user-1',
      studentIdCode: 'STU1001',
      gradeLevel: 'Grade 10',
      interests: ['Math'],
      major: 'CS',
    });

    const initialUpdatedAt = profile.updatedAt;

    profile.updateProfile({
      gradeLevel: 'Grade 11',
      interests: ['Physics'],
      major: 'Engineering',
    });

    expect(profile.gradeLevel).toBe('Grade 11');
    expect(profile.interests).toEqual(['Physics']);
    expect(profile.major).toBe('Engineering');
    expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(
      initialUpdatedAt.getTime(),
    );
  });
});
