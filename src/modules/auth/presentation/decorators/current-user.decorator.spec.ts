import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  function getParamDecoratorFactory(decorator: Function) {
    class TestController {
      public test(@CurrentUser() user: any) {}
    }

    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'test');
    const key = Object.keys(metadata)[0];
    return metadata[key].factory;
  }

  it('should extract user from request context', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
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
