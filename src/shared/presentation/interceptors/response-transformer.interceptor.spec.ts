import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResponseTransformInterceptor } from './response-transformer.interceptor';
import { of } from 'rxjs';
import { I18nContext } from 'nestjs-i18n';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<any>;
  let reflector: jest.Mocked<Reflector>;
  let mockContext: ExecutionContext;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockResponse: any;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;

    interceptor = new ResponseTransformInterceptor(reflector);

    mockResponse = { statusCode: 200 };
    mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
      getHandler: () => ({}),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ result: 'data' })),
    };
  });

  it('should transform response using default message when no decorator message present', (done) => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    reflector.get.mockReturnValue(undefined);

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Operation completed successfully.',
        data: { result: 'data' },
      });
      done();
    });
  });

  it('should transform response using translated message when i18n is available', (done) => {
    const mockI18n = {
      t: jest.fn().mockReturnValue('User registered successfully'),
    };
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);
    reflector.get.mockReturnValue('auth.USER_REGISTERED_SUCCESSFULLY');

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(mockI18n.t).toHaveBeenCalledWith('auth.USER_REGISTERED_SUCCESSFULLY');
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'User registered successfully',
        data: { result: 'data' },
      });
      done();
    });
  });

  it('should map undefined or null data to null in response', (done) => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    reflector.get.mockReturnValue(undefined);
    mockCallHandler.handle.mockReturnValue(of(undefined));

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.data).toBeNull();
      done();
    });
  });
});
