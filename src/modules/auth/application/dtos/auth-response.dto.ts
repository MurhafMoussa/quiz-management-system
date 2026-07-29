import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { BaseUserSchema } from './auth.schemas';
const AuthResponseSchema = z.object({
    //todo uncomment these fields when implementing JWT authentication
    // accessToken: z.string(), 
    // refreshToken: z.string(),
    user: BaseUserSchema,
});
export class AuthResponseDto extends createZodDto(AuthResponseSchema) {

}