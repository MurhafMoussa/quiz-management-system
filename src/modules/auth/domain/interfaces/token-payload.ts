import { Role } from '../enums/role.enum';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}
