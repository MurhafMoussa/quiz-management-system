import { Body, Controller, Injectable, Post } from '@nestjs/common';
import { ResponseMessage } from 'src/shared/presentation/decorators/response-message.decorator';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { RegisterHandler } from '../../application/handlers/register.handler';
@Injectable()
@Controller('auth')
export class AuthController {

    constructor(private readonly registerHandler: RegisterHandler) { }

    @Post('register')
    @ResponseMessage('auth.USER_REGISTERED_SUCCESSFULLY')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return await this.registerHandler.handle(registerUserDto);

    }
}