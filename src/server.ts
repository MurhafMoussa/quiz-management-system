import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodI18nExceptionFilter } from './shared/filters/zod-i18n-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ZodI18nExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
