import { ArgonPasswordHasher } from './argon-string-hasher';

describe('ArgonPasswordHasher', () => {
  let hasher: ArgonPasswordHasher;

  beforeEach(() => {
    hasher = new ArgonPasswordHasher();
  });

  it('should hash a password and verify it correctly', async () => {
    const plainPassword = 'mySecretPassword123';
    const hash = await hasher.hash(plainPassword);

    expect(hash).not.toBe(plainPassword);

    const isValid = await hasher.compare(plainPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await hasher.compare('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});
