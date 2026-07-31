import { I18nPath } from "src/generated/i18n.generated";
export abstract class DomainException extends Error {
    constructor(
        public readonly key: I18nPath,
        public readonly args?: Record<string, any>,
        public readonly code?:number
    ) {
        super(key);
    }
}