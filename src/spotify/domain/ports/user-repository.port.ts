import { User } from '../entities/user.entity';

export abstract class UserRepositoryPort {
  [x: string]: any;
  abstract findBySpotifyId(spotifyId: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract saveOrUpdate(user: User): Promise<User>;
  abstract update(user: User): Promise<User>;
  abstract delete(spotifyId: string): Promise<void>;
}
