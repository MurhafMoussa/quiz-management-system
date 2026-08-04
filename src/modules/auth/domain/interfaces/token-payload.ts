import { Role } from 'src/shared/domain/enums/role.enum';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}
