import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { CreateStudentProfileHandler } from '../../application/handlers/create-student-profile.handler';
import { CreateTeacherProfileHandler } from '../../application/handlers/create-teacher-profile.handler';
import { GetMyProfileHandler } from '../../application/handlers/get-my-profile.handler';
import { GetStudentProfileHandler } from '../../application/handlers/get-student-profile.handler';
import { GetTeacherProfileHandler } from '../../application/handlers/get-teacher-profile.handler';
import { UpdateStudentProfileHandler } from '../../application/handlers/update-student-profile.handler';
import { UpdateTeacherProfileHandler } from '../../application/handlers/update-teacher-profile.handler';
import { TOKEN_SERVICE_TOKEN } from 'src/modules/auth/domain/interfaces/token.service';
import { Role } from 'src/shared/domain/enums/role.enum';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let getMyProfileHandler: jest.Mocked<GetMyProfileHandler>;
  let createStudentProfileHandler: jest.Mocked<CreateStudentProfileHandler>;
  let updateStudentProfileHandler: jest.Mocked<UpdateStudentProfileHandler>;
  let getStudentProfileHandler: jest.Mocked<GetStudentProfileHandler>;
  let createTeacherProfileHandler: jest.Mocked<CreateTeacherProfileHandler>;
  let updateTeacherProfileHandler: jest.Mocked<UpdateTeacherProfileHandler>;
  let getTeacherProfileHandler: jest.Mocked<GetTeacherProfileHandler>;

  beforeEach(async () => {
    getMyProfileHandler = { handle: jest.fn() } as any;
    createStudentProfileHandler = { handle: jest.fn() } as any;
    updateStudentProfileHandler = { handle: jest.fn() } as any;
    getStudentProfileHandler = { handle: jest.fn() } as any;
    createTeacherProfileHandler = { handle: jest.fn() } as any;
    updateTeacherProfileHandler = { handle: jest.fn() } as any;
    getTeacherProfileHandler = { handle: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: GetMyProfileHandler, useValue: getMyProfileHandler },
        {
          provide: CreateStudentProfileHandler,
          useValue: createStudentProfileHandler,
        },
        {
          provide: UpdateStudentProfileHandler,
          useValue: updateStudentProfileHandler,
        },
        {
          provide: GetStudentProfileHandler,
          useValue: getStudentProfileHandler,
        },
        {
          provide: CreateTeacherProfileHandler,
          useValue: createTeacherProfileHandler,
        },
        {
          provide: UpdateTeacherProfileHandler,
          useValue: updateTeacherProfileHandler,
        },
        {
          provide: GetTeacherProfileHandler,
          useValue: getTeacherProfileHandler,
        },
        {
          provide: TOKEN_SERVICE_TOKEN,
          useValue: { verifyAccessToken: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should call getMyProfileHandler on getMyProfile()', async () => {
    const user = { userId: 'u-1', email: 'a@b.com', role: Role.STUDENT };
    const expectedResponse = {
      id: 'u-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'a@b.com',
      isVerified: true,
      role: Role.STUDENT,
      profile: {
        id: 'sp-1',
        userId: 'u-1',
        studentIdCode: 'STU1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    getMyProfileHandler.handle.mockResolvedValue(expectedResponse);

    const result = await controller.getMyProfile(user);

    expect(getMyProfileHandler.handle).toHaveBeenCalledWith('u-1');
    expect(result.role).toBe(Role.STUDENT);
  });

  it('should call createStudentProfileHandler on createMyStudentProfile()', async () => {
    const user = { userId: 'u-1', email: 'a@b.com', role: Role.STUDENT };
    const dto = { studentIdCode: 'STU1' };
    createStudentProfileHandler.handle.mockResolvedValue({ id: 'sp-1' } as any);

    const result = await controller.createMyStudentProfile(user, dto);

    expect(createStudentProfileHandler.handle).toHaveBeenCalledWith(
      'u-1',
      Role.STUDENT,
      'u-1',
      dto,
    );
    expect(result.id).toBe('sp-1');
  });

  it('should call updateStudentProfileHandler on updateStudentProfile()', async () => {
    const user = { userId: 'u-1', email: 'a@b.com', role: Role.ADMIN };
    const dto = { gradeLevel: '12' };
    updateStudentProfileHandler.handle.mockResolvedValue({ id: 'sp-2' } as any);

    const result = await controller.updateStudentProfile(user, 'u-2', dto);

    expect(updateStudentProfileHandler.handle).toHaveBeenCalledWith(
      'u-1',
      Role.ADMIN,
      'u-2',
      dto,
    );
    expect(result.id).toBe('sp-2');
  });

  it('should call getTeacherProfileHandler on getTeacherProfile()', async () => {
    getTeacherProfileHandler.handle.mockResolvedValue({ id: 'tp-1' } as any);

    const result = await controller.getTeacherProfile('u-2');

    expect(getTeacherProfileHandler.handle).toHaveBeenCalledWith('u-2');
    expect(result.id).toBe('tp-1');
  });
});
