import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ZodI18nExceptionFilter } from './zod-i18n-exception.filter';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { I18nContext } from 'nestjs-i18n';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('ZodI18nExceptionFilter', () => {
  let filter: ZodI18nExceptionFilter;
  let mockResponse: any;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  beforeEach(() => {
    filter = new ZodI18nExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  it('should format ZodValidationException with issues when i18n is not present', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    const zodError = new ZodError([
      {
        code: 'too_small',
        minimum: 8,
        origin: 'string',
        inclusive: true,
        exact: false,
        message: 'validation.PASSWORD_TOO_SHORT',
        path: ['password'],
      },
    ]);
    const exception = new ZodValidationException(zodError);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      errors: [
        {
          field: 'password',
          message: 'validation.PASSWORD_TOO_SHORT',
        },
      ],
    });
  });

  it('should format ZodValidationException with translated message when i18n is present', () => {
    const mockI18n = {
      t: jest.fn().mockReturnValue('Password must be at least 8 characters'),
    };
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);

    const zodError = new ZodError([
      {
        code: 'too_small',
        minimum: 8,
        origin: 'string',
        inclusive: true,
        exact: false,
        message: 'validation.PASSWORD_TOO_SHORT',
        path: ['password'],
      },
    ]);
    const exception = new ZodValidationException(zodError);

    filter.catch(exception, mockArgumentsHost);

    expect(mockI18n.t).toHaveBeenCalledWith('validation.PASSWORD_TOO_SHORT', {
      args: { field: 'password', min: 8 },
      defaultValue: 'validation.PASSWORD_TOO_SHORT',
    });
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      errors: [
        {
          field: 'password',
          message: 'Password must be at least 8 characters',
        },
      ],
    });
  });

  it('should handle exception with non-ZodError gracefully', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    const exception = {
      getZodError: () => null,
    } as any;

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      errors: [],
    });
  });
});
