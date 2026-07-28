export const PASSWORD_HASHER_TOKEN = Symbol('PasswordHasher');
export interface PasswordHasher {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}