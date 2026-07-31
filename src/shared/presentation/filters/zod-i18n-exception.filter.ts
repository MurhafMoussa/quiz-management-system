// presentation/filters/zod-i18n-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '../interfaces/api-error-response';

@Catch(ZodValidationException)
export class ZodI18nExceptionFilter implements ExceptionFilter {
    catch(exception: ZodValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const i18n = I18nContext.current(host);

        // 1. Call getZodError() instead of accessing it as a property
        const zodError = exception.getZodError();

        // 2. Ensure it's a valid ZodError before reading issues
        const issues = zodError instanceof ZodError ? zodError.issues : [];

        // 3. Map & translate issues
        const errors = issues.map((issue) => {
            const field = issue.path.join('.') || 'Field';
            const messageKey = issue.message;

            const minVal = 'minimum' in issue ? issue.minimum : undefined;
            const maxVal = 'maximum' in issue ? issue.maximum : undefined;

            const issueArgs: Record<string, any> = {
                field,
                ...(minVal !== undefined ? { min: minVal } : {}),
                ...(maxVal !== undefined ? { max: maxVal } : {}),
            };

            const translatedMessage = i18n
                ? i18n.t(messageKey, {
                    args: issueArgs,
                    defaultValue: messageKey,
                })
                : messageKey;

            return {
                field,
                message: translatedMessage,
            };
        });
        const statusCode = HttpStatus.BAD_REQUEST;
        const apiErrorResponse: ApiErrorResponse = {
            errors: errors,
            statusCode: statusCode,
            success: false,
        };
        response.status(statusCode).json(apiErrorResponse);

    }
}