import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { DomainException } from 'src/shared/domain/exceptions/domain.exception';
import { I18nContext } from 'nestjs-i18n';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: any;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
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

  class TestDomainException extends DomainException {
    constructor() {
      super('auth.USER_ALREADY_EXISTS' as any, { user: 'John' });
    }
  }

  it('should format domain exception response using key when i18n is not present', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    const exception = new TestDomainException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'auth.USER_ALREADY_EXISTS',
    });
  });

  it('should format domain exception response using translated message when i18n is present', () => {
    const mockI18n = {
      t: jest.fn().mockReturnValue('Translated test error for John'),
    };
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);

    const exception = new TestDomainException();
    filter.catch(exception, mockArgumentsHost);

    expect(mockI18n.t).toHaveBeenCalledWith('auth.USER_ALREADY_EXISTS', {
      args: { user: 'John' },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Translated test error for John',
    });
  });
});
