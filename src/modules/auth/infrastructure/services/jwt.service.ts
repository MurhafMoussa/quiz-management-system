// src/modules/auth/infrastructure/services/jwt-token.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from 'src/config/env.validation';
import { AuthTokens } from 'src/modules/auth/domain/interfaces/auth-tokens';
import { TokenPayload } from 'src/modules/auth/domain/interfaces/token-payload';
import { TokenService } from 'src/modules/auth/domain/interfaces/token.service';
import { InvalidAccessTokenException } from '../exceptions/invalid-access-token.exception';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception';

@Injectable()
export class JwtTokenService implements TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService<EnvironmentVariables, true>,
    ) { }

    async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    async verifyRefreshToken(token: string): Promise<TokenPayload> {
        try {
            return this.verifyToken(token, 'JWT_REFRESH_TOKEN_SECRET');
        } catch {
            throw new InvalidRefreshTokenException();
        }
    }
    async verifyAccessToken(token: string): Promise<TokenPayload> {
        try {
            return this.verifyToken(token, 'JWT_ACCESS_TOKEN_SECRET');
        } catch {
            throw new InvalidAccessTokenException();
        }
    }
    private async verifyToken(token: string, secret: 'JWT_REFRESH_TOKEN_SECRET' | 'JWT_ACCESS_TOKEN_SECRET'): Promise<TokenPayload> {
        return await this.jwtService.verifyAsync<TokenPayload>(token, {
            secret: this.configService.get<string>(secret),
        });
    }

}