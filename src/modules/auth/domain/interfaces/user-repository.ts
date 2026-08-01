import { User } from '../entities/user.entity';

export const USER_REPOSITORY_TOKEN = Symbol('UserRepository');
export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;

  save(user: User): Promise<User>;
}
