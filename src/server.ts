import { NestFactory } from '@nestjs/core';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Enable CORS if needed
  app.enableCors();

  // Configure Swagger Document
  const config = new DocumentBuilder()
    .setTitle('Quiz Management Platform API')
    .setDescription('Enterprise DDD Quiz Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  cleanupOpenApiDoc(document); 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


