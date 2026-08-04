import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/shared/domain/enums/role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  it('should return true if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return true if user has required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { userId: '1', email: 'admin@example.com', role: Role.ADMIN },
        }),
      }),
    } as any;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw ForbiddenException if user does not have required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            userId: '1',
            email: 'student@example.com',
            role: Role.STUDENT,
          },
        }),
      }),
    } as any;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});
