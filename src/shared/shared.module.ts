import { Global, Module } from '@nestjs/common';
import { ID_GENERATOR_TOKEN } from './domain/interfaces/id-generator';
import { RANDOM_GENERATOR_TOKEN } from './domain/interfaces/random-generator';
import { CryptoRandomGenerator } from './infrastructure/services/crypto-random-generator';
import { PrismaService } from './infrastructure/services/prisma.service';
import { UuidV7Generator } from './infrastructure/services/uuid-v7-generator';

@Global()
@Module({
  providers: [
    {
      provide: ID_GENERATOR_TOKEN,
      useClass: UuidV7Generator,
    },
    {
      provide: RANDOM_GENERATOR_TOKEN,
      useClass: CryptoRandomGenerator,
    },
    PrismaService,
  ],
  exports: [PrismaService, ID_GENERATOR_TOKEN, RANDOM_GENERATOR_TOKEN],
})
export class SharedModule {}
