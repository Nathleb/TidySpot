import { User } from '../../entities/user.entity';

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<User | null>;
  abstract saveOrUpdate(user: User): Promise<User>;
}
