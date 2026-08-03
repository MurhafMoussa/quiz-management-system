import { CryptoRandomGenerator } from './crypto-random-generator';

describe('CryptoRandomGenerator', () => {
  let generator: CryptoRandomGenerator;

  beforeEach(() => {
    generator = new CryptoRandomGenerator();
  });

  it('should generate a 6-digit numeric string by default', () => {
    const code = generator.generate();

    expect(code).toMatch(/^\d{6}$/);
  });

  it('should generate a code with specified length', () => {
    const length = 8;
    const code = generator.generate(length);

    expect(code).toMatch(/^\d{8}$/);
    expect(code.length).toBe(8);
  });
});
