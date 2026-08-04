import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { ZodValidationPipe } from 'nestjs-zod';
import * as path from 'path';
import { validate } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { DomainExceptionFilter } from './shared/presentation/filters/domain-exception.filter';
import { GlobalExceptionFilter } from './shared/presentation/filters/global-exception.filter';
import { ZodI18nExceptionFilter } from './shared/presentation/filters/zod-i18n-exception.filter';
import { ResponseTransformInterceptor } from './shared/presentation/interceptors/response-transformer.interceptor';
import { SharedModule } from './shared/shared.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { TimeUtils } from './shared/utils/time.utils';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfileModule } from './modules/profiles/profiles.module';
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get<string>('REDIS_PASSWORD');
        const auth = password ? `:${password}@` : '';
        const redisUrl = `redis://${auth}${host}:${port}`;

        return {
          stores: [new Keyv({ store: new KeyvRedis(redisUrl) })],
          ttl: TimeUtils.convertMinutesToMilliseconds(15),
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validate,
    }),
    EventEmitterModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, './locales/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['x-custom-lang', 'accept-language']),
        AcceptLanguageResolver,
      ],
      typesOutputPath: path.join(
        process.cwd(),
        'src/generated/i18n.generated.ts',
      ),
    }),
    SharedModule,
    AuthModule,
    NotificationsModule,
    ProfileModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodI18nExceptionFilter,
    },
  ],
})
export class AppModule {}
