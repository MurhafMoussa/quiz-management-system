import { DomainException } from "src/shared/domain/exceptions/domain.exception";

export class InvalidCredentialsException extends DomainException{
    constructor() {
        super("auth.INVALID_CREDENTIALS");
    }
}