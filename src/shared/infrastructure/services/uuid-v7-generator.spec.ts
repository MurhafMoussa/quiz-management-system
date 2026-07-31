jest.mock('uuid', () => ({
  v7: jest.fn().mockReturnValue('018c1f9b-6400-7a00-8000-123456789abc'),
}));

import { UuidV7Generator } from './uuid-v7-generator';

describe('UuidV7Generator', () => {
  let generator: UuidV7Generator;

  beforeEach(() => {
    generator = new UuidV7Generator();
  });

  it('should generate a valid UUID v7 string', () => {
    const id = generator.generate();
    expect(typeof id).toBe('string');
    expect(id).toBe('018c1f9b-6400-7a00-8000-123456789abc');
  });
});
