export const HASHER_TOKEN = Symbol('Hasher');
export interface Hasher {
    hash(str: string): Promise<string>;
    compare(str: string, hash: string): Promise<boolean>;
}