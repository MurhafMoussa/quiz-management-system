import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from 'src/shared/domain/enums/role.enum';

export const UpdateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export class UpdateUserRoleDto extends createZodDto(UpdateUserRoleSchema) {}
