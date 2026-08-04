import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CreateStudentProfileHandler } from './application/handlers/create-student-profile.handler';
import { CreateTeacherProfileHandler } from './application/handlers/create-teacher-profile.handler';
import { GetMyProfileHandler } from './application/handlers/get-my-profile.handler';
import { GetStudentProfileHandler } from './application/handlers/get-student-profile.handler';
import { GetTeacherProfileHandler } from './application/handlers/get-teacher-profile.handler';
import { UpdateStudentProfileHandler } from './application/handlers/update-student-profile.handler';
import { UpdateTeacherProfileHandler } from './application/handlers/update-teacher-profile.handler';
import { PROFILE_REPOSITORY_TOKEN } from './domain/interfaces/profile-repository';
import { PrismaProfileRepository } from './infrastructure/repositories/prisma-profile.repository';
import { ProfilesController } from './presentation/controllers/profiles.controller';

@Module({
  imports: [AuthModule],
  controllers: [ProfilesController],
  providers: [
    CreateStudentProfileHandler,
    UpdateStudentProfileHandler,
    GetStudentProfileHandler,
    CreateTeacherProfileHandler,
    UpdateTeacherProfileHandler,
    GetTeacherProfileHandler,
    GetMyProfileHandler,
    {
      provide: PROFILE_REPOSITORY_TOKEN,
      useClass: PrismaProfileRepository,
    },
  ],
  exports: [PROFILE_REPOSITORY_TOKEN],
})
export class ProfileModule {}
