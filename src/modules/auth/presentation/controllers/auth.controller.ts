import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseMessage } from 'src/shared/presentation/decorators/response-message.decorator';
import { LoginUserDto } from '../../application/dtos/login-user.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { GetCurrentUserHandler } from '../../application/handlers/get-current-user.handler';
import { LoginHandler } from '../../application/handlers/login.handler';
import { RefreshTokenHandler } from '../../application/handlers/refresh-token.handler';
import { RegisterHandler } from '../../application/handlers/register.handler';
import type { TokenPayload } from '../../domain/interfaces/token-payload';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';
@Injectable()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly getCurrentUserHandler: GetCurrentUserHandler,
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
  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('auth.PROFILE_RETRIEVED_SUCCESSFULLY')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentUser(@CurrentUser() payload: TokenPayload) {
    return this.getCurrentUserHandler.handle(payload.userId);
  }
}
