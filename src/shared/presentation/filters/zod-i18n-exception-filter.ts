// presentation/filters/zod-i18n-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

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
            const messageKey = issue.message;
            const translatedMessage = i18n ? i18n.t(messageKey) : messageKey;

            return {
                field: issue.path.join('.'),
                message: translatedMessage,
            };
        });

        response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Unprocessable Entity',
            errors,
        });
    }
}