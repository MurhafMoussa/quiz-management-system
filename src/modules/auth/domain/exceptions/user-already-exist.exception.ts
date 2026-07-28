import { Path } from "nestjs-i18n";
import { I18nTranslations } from "src/generated/i18n.generated";
import { DomainException } from "src/shared/domain/exceptions/domain.exception";

export class UserAlreadyExistException extends DomainException {
    constructor(email: string) {
        const key: Path<I18nTranslations> = 'auth.EMAIL_ALREADY_EXISTS' as Path<I18nTranslations>;
        super(key, { email });

    }
}