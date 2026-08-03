import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { RandomGenerator } from '../../domain/interfaces/random-generator';

@Injectable()
export class CryptoRandomGenerator implements RandomGenerator<string> {
  generate(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max + 1).toString();
  }
}
