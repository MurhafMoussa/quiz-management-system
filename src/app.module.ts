import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ZodValidationPipe } from 'nestjs-zod';
import * as path from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { ZodI18nExceptionFilter } from './shared/presentation/filters/zod-i18n-exception-filter';
import { ResponseTransformInterceptor } from './shared/presentation/interceptors/response-transformer.interceptor';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, './locales/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang']),
        AcceptLanguageResolver,
      ],
      typesOutputPath: path.join(
        process.cwd(),
        'src/generated/i18n.generated.ts',
      ),
    }),
    SharedModule,
    AuthModule,],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    }, {
      provide: APP_FILTER,
      useClass: ZodI18nExceptionFilter,
    },
  ],

})
export class AppModule { }

