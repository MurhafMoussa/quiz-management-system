import { Body, Controller, HttpCode, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ResponseMessage } from 'src/shared/presentation/decorators/response-message.decorator';
import { LoginUserDto } from '../../application/dtos/login-user.dto';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { LoginHandler } from '../../application/handlers/login.handler';
import { RegisterHandler } from '../../application/handlers/register.handler';
@Injectable()
@Controller('auth')
export class AuthController {
    constructor(private readonly registerHandler: RegisterHandler, private readonly loginHandler: LoginHandler) { }
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
}