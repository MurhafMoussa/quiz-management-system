import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseMessage } from '../decorators/response-message.decorator';
import { ApiSuccessResponse } from '../interfaces/api-success-response';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccessResponse<T>> {
        const http = context.switchToHttp();
        const response = http.getResponse<Response>();
        const i18n = I18nContext.current(context);

        const customMessageKey = this.reflector.get(ResponseMessage, context.getHandler());
        const defaultMessage = 'Operation completed successfully.';

        const message: string = customMessageKey
            ? i18n ? i18n.t(customMessageKey) : customMessageKey
            : defaultMessage;

        return next.handle().pipe(
            map((data) => ({
                success: true,
                statusCode: response.statusCode,
                message,
                data: data ?? null,
            })),
        );
    }
}