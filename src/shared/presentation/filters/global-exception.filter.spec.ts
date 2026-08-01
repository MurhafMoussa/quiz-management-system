import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { I18nContext } from 'nestjs-i18n';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  it('should return early if host context is not http', () => {
    mockArgumentsHost.getType.mockReturnValue('rpc');
    filter.catch(new Error('Some error'), mockArgumentsHost);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should handle HttpException correctly', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    const httpException = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(httpException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Forbidden',
    });
  });

  it('should handle HttpException with object message array correctly', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    const httpException = new HttpException(
      { message: ['First validation error', 'Second error'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(httpException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'First validation error',
    });
  });

  it('should handle HttpException with object single message string correctly', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    const httpException = new HttpException(
      { message: 'Custom error message' },
      HttpStatus.UNAUTHORIZED,
    );

    filter.catch(httpException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Custom error message',
    });
  });

  it('should translate message using i18n when available', () => {
    const mockI18n = {
      t: jest.fn().mockReturnValue('Translated error'),
    };
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);

    const httpException = new HttpException(
      'common.NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );

    filter.catch(httpException, mockArgumentsHost);

    expect(mockI18n.t).toHaveBeenCalledWith('common.NOT_FOUND', {
      defaultValue: 'common.NOT_FOUND',
    });
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Translated error',
    });
  });

  it('should handle non-HttpException with non-Error object correctly', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);
    jest.spyOn((filter as any).logger, 'error').mockImplementation(() => {});

    filter.catch('String exception', mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
