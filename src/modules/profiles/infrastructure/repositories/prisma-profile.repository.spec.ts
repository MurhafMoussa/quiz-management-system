import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/shared/infrastructure/services/prisma.service';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { TeacherProfile } from '../../domain/entities/teacher-profile.entity';
import { PrismaProfileRepository } from './prisma-profile.repository';

describe('PrismaProfileRepository', () => {
  let repository: PrismaProfileRepository;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      teacherProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      studentProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProfileRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<PrismaProfileRepository>(PrismaProfileRepository);
  });

  it('should find student profile by userId', async () => {
    const date = new Date();
    prismaService.studentProfile.findUnique.mockResolvedValue({
      id: 'sp-1',
      user_id: 'u-1',
      student_id_code: 'STU01',
      grade_level: 'Grade 10',
      interests: ['Math'],
      major: 'CS',
      created_at: date,
      updated_at: date,
    });

    const result = await repository.findStudentProfileByUserId('u-1');

    expect(prismaService.studentProfile.findUnique).toHaveBeenCalledWith({
      where: { user_id: 'u-1' },
    });
    expect(result).toBeInstanceOf(StudentProfile);
    expect(result?.userId).toBe('u-1');
  });

  it('should return null if student profile is not found', async () => {
    prismaService.studentProfile.findUnique.mockResolvedValue(null);

    const result = await repository.findStudentProfileByUserId('u-99');
    expect(result).toBeNull();
  });

  it('should save student profile', async () => {
    const profile = StudentProfile.create({
      id: 'sp-1',
      userId: 'u-1',
      studentIdCode: 'STU01',
    });

    await repository.saveStudentProfile(profile);

    expect(prismaService.studentProfile.upsert).toHaveBeenCalledWith({
      where: { user_id: 'u-1' },
      create: expect.any(Object),
      update: expect.any(Object),
    });
  });

  it('should find teacher profile by userId', async () => {
    const date = new Date();
    prismaService.teacherProfile.findUnique.mockResolvedValue({
      id: 'tp-1',
      user_id: 'u-2',
      title: 'Dr.',
      bio: 'Bio',
      department: 'Sci',
      subject_specialties: ['Physics'],
      created_at: date,
      updated_at: date,
    });

    const result = await repository.findTeacherProfileByUserId('u-2');

    expect(prismaService.teacherProfile.findUnique).toHaveBeenCalledWith({
      where: { user_id: 'u-2' },
    });
    expect(result).toBeInstanceOf(TeacherProfile);
    expect(result?.userId).toBe('u-2');
  });

  it('should save teacher profile', async () => {
    const profile = TeacherProfile.create({
      id: 'tp-1',
      userId: 'u-2',
    });

    await repository.saveTeacherProfile(profile);

    expect(prismaService.teacherProfile.upsert).toHaveBeenCalledWith({
      where: { user_id: 'u-2' },
      create: expect.any(Object),
      update: expect.any(Object),
    });
  });
});
