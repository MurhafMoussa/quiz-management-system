import { TeacherProfile } from './teacher-profile.entity';

describe('TeacherProfile Entity', () => {
  it('should create a new teacher profile and set timestamps', () => {
    const profile = TeacherProfile.create({
      id: 'tp-1',
      userId: 'user-2',
      title: 'Dr.',
      bio: 'Physics Professor',
      department: 'Science',
      subjectSpecialties: ['Physics', 'Quantum Mechanics'],
    });

    expect(profile.id).toBe('tp-1');
    expect(profile.userId).toBe('user-2');
    expect(profile.title).toBe('Dr.');
    expect(profile.bio).toBe('Physics Professor');
    expect(profile.department).toBe('Science');
    expect(profile.subjectSpecialties).toEqual([
      'Physics',
      'Quantum Mechanics',
    ]);
    expect(profile.createdAt).toBeInstanceOf(Date);
    expect(profile.updatedAt).toBeInstanceOf(Date);
  });

  it('should update profile fields and touch updatedAt', () => {
    const profile = TeacherProfile.create({
      id: 'tp-1',
      userId: 'user-2',
      title: 'Mr.',
      bio: 'Math Teacher',
      department: 'Math',
      subjectSpecialties: ['Algebra'],
    });

    const initialUpdatedAt = profile.updatedAt;

    profile.updateProfile({
      title: 'Prof.',
      bio: 'Senior Math Professor',
      department: 'Advanced Math',
      subjectSpecialties: ['Calculus', 'Linear Algebra'],
    });

    expect(profile.title).toBe('Prof.');
    expect(profile.bio).toBe('Senior Math Professor');
    expect(profile.department).toBe('Advanced Math');
    expect(profile.subjectSpecialties).toEqual(['Calculus', 'Linear Algebra']);
    expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(
      initialUpdatedAt.getTime(),
    );
  });
});
