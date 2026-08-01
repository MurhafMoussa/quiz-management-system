/* eslint-disable @typescript-eslint/no-unused-vars */
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  function getParamDecoratorFactory() {
    class TestController {
      public test(@CurrentUser() _user: unknown) {}
    }

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );
    const key = Object.keys(metadata)[0];
    return metadata[key].factory;
  }

  it('should extract user from request context', () => {
    const factory = getParamDecoratorFactory();
    const mockUser = { userId: 'user-1', email: 'user@example.com' };

    const mockContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as any;

    const result = factory(null, mockContext);
    expect(result).toEqual(mockUser);
  });
});
