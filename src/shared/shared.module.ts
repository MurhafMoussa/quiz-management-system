import { Global, Module } from '@nestjs/common';
import { ID_GENERATOR_TOKEN } from './domain/interfaces/id-generator';
import { PrismaService } from './infrastructure/services/prisma.service';
import { UuidV7Generator } from './infrastructure/services/uuid-v7-generator';
@Global()
@Module({
  providers: [
    {
      provide: ID_GENERATOR_TOKEN,
      useClass: UuidV7Generator,
    },
    PrismaService,
  ],
  exports: [PrismaService, ID_GENERATOR_TOKEN],
})
export class SharedModule {}
