import { UnauthorizedException } from "@nestjs/common";

export class InvalidAccessTokenException extends UnauthorizedException{
    constructor() {
        super('auth.INVALID_REFRESH_TOKEN'); 
    }
}