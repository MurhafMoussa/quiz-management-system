import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationQuerySchema = z
  .object({
    page: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : 1),
      z.number().int().min(1).default(1),
    ),
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : 10),
      z.number().int().min(1).max(100).default(10),
    ),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
  })
  .catchall(z.any());

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}
