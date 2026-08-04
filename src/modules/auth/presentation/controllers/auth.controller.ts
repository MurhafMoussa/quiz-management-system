import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseMessage } from 'src/shared/presentation/decorators/response-message.decorator';
import { LoginUserDto } from '../../application/dtos/login-user.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { UpdateUserRoleDto } from '../../application/dtos/update-user-role.dto';
import { VerifyEmailDto } from '../../application/dtos/verify-email.dto';
import { LoginHandler } from '../../application/handlers/login.handler';
import { RefreshTokenHandler } from '../../application/handlers/refresh-token.handler';
import { RegisterHandler } from '../../application/handlers/register.handler';
import { UpdateUserRoleHandler } from '../../application/handlers/update-user-role.handler';
import { VerifyEmailHandler } from '../../application/handlers/verify-email.handler';
import { Role } from 'src/shared/domain/enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Injectable()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly verifyEmailHandler: VerifyEmailHandler,
    private readonly updateUserRoleHandler: UpdateUserRoleHandler,
  ) {}
  @Post('register')
  @ResponseMessage('auth.USER_REGISTERED_SUCCESSFULLY')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.registerHandler.handle(registerUserDto);
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.USER_LOGGED_IN_SUCCESSFULLY')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.loginHandler.handle(loginUserDto);
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.TOKEN_REFRESHED_SUCCESSFULLY')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenHandler.handle(dto.refreshToken);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.EMAIL_VERIFIED_SUCCESSFULLY')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.verifyEmailHandler.execute(dto.userId, dto.code);
  }

  @Patch('users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.USER_ROLE_UPDATED_SUCCESSFULLY')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.updateUserRoleHandler.handle(userId, dto);
  }
}
