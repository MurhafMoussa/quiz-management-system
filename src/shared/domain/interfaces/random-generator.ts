export const RANDOM_GENERATOR_TOKEN = Symbol('RANDOM_GENERATOR_TOKEN');

export interface RandomGenerator<T = string> {
  generate(length?: number): T;
}
