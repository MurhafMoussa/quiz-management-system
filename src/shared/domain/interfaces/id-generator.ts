export const ID_GENERATOR_TOKEN = Symbol('IdGenerator');
export interface IdGenerator {
  generate(): string;
}
