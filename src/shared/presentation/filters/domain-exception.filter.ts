import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { DomainException } from 'src/shared/domain/exceptions/domain.exception';
import { ApiErrorResponse } from '../interfaces/api-error-response';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const i18n = I18nContext.current(host);
    const messageKey = exception.key;
    const translatedMessage: string = i18n
      ? i18n.t(messageKey, { args: exception.args })
      : messageKey;
    const statusCode = exception.code || HttpStatus.BAD_REQUEST;
    const apiErrorResponse: ApiErrorResponse = {
      message: translatedMessage,
      statusCode: statusCode,
      success: false,
    };
    response.status(statusCode).json(apiErrorResponse);
  }
}
