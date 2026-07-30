import { AuthTokens } from "src/modules/auth/domain/interfaces/auth-tokens";
import { TokenPayload } from "src/modules/auth/domain/interfaces/token-payload";
export const TOKEN_SERVICE_TOKEN = Symbol('TokenService');
export interface TokenService {
    generateTokens(payload: TokenPayload): Promise<AuthTokens>;
    verifyRefreshToken(token: string): Promise<TokenPayload>;
}