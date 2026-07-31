
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TOKEN_SERVICE_TOKEN, type TokenService } from '../../domain/interfaces/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(TOKEN_SERVICE_TOKEN) private readonly tokenService: TokenService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        const payload = await this.tokenService.verifyAccessToken(token);
        request['user'] = payload;
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
