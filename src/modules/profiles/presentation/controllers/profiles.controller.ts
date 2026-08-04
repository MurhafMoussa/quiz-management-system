import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/presentation/guards/auth.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { TokenPayload } from 'src/modules/auth/domain/interfaces/token-payload';
import { ResponseMessage } from 'src/shared/presentation/decorators/response-message.decorator';
import {
  CreateStudentProfileDto,
  UpdateStudentProfileDto,
} from '../../application/dtos/student-profile.dto';
import {
  CreateTeacherProfileDto,
  UpdateTeacherProfileDto,
} from '../../application/dtos/teacher-profile.dto';
import { CreateStudentProfileHandler } from '../../application/handlers/create-student-profile.handler';
import { CreateTeacherProfileHandler } from '../../application/handlers/create-teacher-profile.handler';
import { GetMyProfileHandler } from '../../application/handlers/get-my-profile.handler';
import { GetStudentProfileHandler } from '../../application/handlers/get-student-profile.handler';
import { GetTeacherProfileHandler } from '../../application/handlers/get-teacher-profile.handler';
import { UpdateStudentProfileHandler } from '../../application/handlers/update-student-profile.handler';
import { UpdateTeacherProfileHandler } from '../../application/handlers/update-teacher-profile.handler';

@Controller('profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(
    private readonly getMyProfileHandler: GetMyProfileHandler,
    private readonly createStudentProfileHandler: CreateStudentProfileHandler,
    private readonly updateStudentProfileHandler: UpdateStudentProfileHandler,
    private readonly getStudentProfileHandler: GetStudentProfileHandler,
    private readonly createTeacherProfileHandler: CreateTeacherProfileHandler,
    private readonly updateTeacherProfileHandler: UpdateTeacherProfileHandler,
    private readonly getTeacherProfileHandler: GetTeacherProfileHandler,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_RETRIEVED_SUCCESSFULLY')
  async getMyProfile(@CurrentUser() user: TokenPayload) {
    return this.getMyProfileHandler.handle(user.userId);
  }

  @Post('student')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('auth.PROFILE_CREATED_SUCCESSFULLY')
  async createMyStudentProfile(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateStudentProfileDto,
  ) {
    return this.createStudentProfileHandler.handle(
      user.userId,
      user.role,
      user.userId,
      dto,
    );
  }

  @Post('student/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('auth.PROFILE_CREATED_SUCCESSFULLY')
  async createStudentProfile(
    @CurrentUser() user: TokenPayload,
    @Param('userId') targetUserId: string,
    @Body() dto: CreateStudentProfileDto,
  ) {
    return this.createStudentProfileHandler.handle(
      user.userId,
      user.role,
      targetUserId,
      dto,
    );
  }

  @Patch('student')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_UPDATED_SUCCESSFULLY')
  async updateMyStudentProfile(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.updateStudentProfileHandler.handle(
      user.userId,
      user.role,
      user.userId,
      dto,
    );
  }

  @Patch('student/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_UPDATED_SUCCESSFULLY')
  async updateStudentProfile(
    @CurrentUser() user: TokenPayload,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.updateStudentProfileHandler.handle(
      user.userId,
      user.role,
      targetUserId,
      dto,
    );
  }

  @Get('student/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_RETRIEVED_SUCCESSFULLY')
  async getStudentProfile(@Param('userId') userId: string) {
    return this.getStudentProfileHandler.handle(userId);
  }

  @Post('teacher')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('auth.PROFILE_CREATED_SUCCESSFULLY')
  async createMyTeacherProfile(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateTeacherProfileDto,
  ) {
    return this.createTeacherProfileHandler.handle(
      user.userId,
      user.role,
      user.userId,
      dto,
    );
  }

  @Post('teacher/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('auth.PROFILE_CREATED_SUCCESSFULLY')
  async createTeacherProfile(
    @CurrentUser() user: TokenPayload,
    @Param('userId') targetUserId: string,
    @Body() dto: CreateTeacherProfileDto,
  ) {
    return this.createTeacherProfileHandler.handle(
      user.userId,
      user.role,
      targetUserId,
      dto,
    );
  }

  @Patch('teacher')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_UPDATED_SUCCESSFULLY')
  async updateMyTeacherProfile(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateTeacherProfileDto,
  ) {
    return this.updateTeacherProfileHandler.handle(
      user.userId,
      user.role,
      user.userId,
      dto,
    );
  }

  @Patch('teacher/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_UPDATED_SUCCESSFULLY')
  async updateTeacherProfile(
    @CurrentUser() user: TokenPayload,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateTeacherProfileDto,
  ) {
    return this.updateTeacherProfileHandler.handle(
      user.userId,
      user.role,
      targetUserId,
      dto,
    );
  }

  @Get('teacher/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_RETRIEVED_SUCCESSFULLY')
  async getTeacherProfile(@Param('userId') userId: string) {
    return this.getTeacherProfileHandler.handle(userId);
  }
}
