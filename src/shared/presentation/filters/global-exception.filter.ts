import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { ApiErrorResponse } from '../interfaces/api-error-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        // 1. Guard context to ensure it's HTTP before attempting to read Express Response
        if (host.getType() !== 'http') {
            return;
        }

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const i18n = I18nContext.current(host);

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let messageKeyOrString = 'common.INTERNAL_SERVER_ERROR';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                messageKeyOrString = res;
            } else if (this.isRecord(res) && 'message' in res) {
                const msg = res.message;
                messageKeyOrString = Array.isArray(msg) ? String(msg[0]) : String(msg);
            }
        } else {
            // 2. Safe stack extraction for observability / log aggregators
            const stack = exception instanceof Error ? exception.stack : JSON.stringify(exception);
            this.logger.error(`Unhandled Exception [${statusCode}]: ${stack}`);
        }

        // 3. Fallback translation with safe key lookup
        const translatedMessage: string = i18n
            ? i18n.t(messageKeyOrString, { defaultValue: messageKeyOrString })
            : messageKeyOrString;

        const apiErrorResponse: ApiErrorResponse = {
            success: false,
            statusCode,
            message: translatedMessage,
        };

        response.status(statusCode).json(apiErrorResponse);
    }

    /**
     * Type-safe runtime guard for objects
     */
    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null;
    }
}