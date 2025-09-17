import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/spotify/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/spotify/domain/ports/user-repository.port';

// In memory repo for local dev
@Injectable()
export class UserRepository extends UserRepositoryPort {
  private users: User[] = [];

  async findBySpotifyId(spotifyId: string): Promise<User | null> {
    const user = this.users.find((u) => u.spotifyId === spotifyId);
    return Promise.resolve(user || null);
  }

  async save(user: User): Promise<User> {
    const existingUser = this.users.find((u) => u.spotifyId === user.spotifyId);
    if (existingUser) {
      throw new Error(`User with Spotify ID ${user.spotifyId} already exists.`);
    }
    this.users.push(user);
    return Promise.resolve(user);
  }

  async update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.spotifyId === user.spotifyId);
    if (index === -1) {
      throw new NotFoundException(
        `User with Spotify ID ${user.spotifyId} not found.`,
      );
    }
    this.users[index] = user;
    return Promise.resolve(user);
  }

  async delete(spotifyId: string): Promise<void> {
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.spotifyId !== spotifyId);
    if (this.users.length === initialLength) {
      throw new NotFoundException(
        `User with Spotify ID ${spotifyId} not found.`,
      );
    }
    return Promise.resolve();
  }

  async saveOrUpdate(user: User): Promise<User> {
    const existingUser = await this.findBySpotifyId(user.spotifyId);
    if (existingUser) {
      return this.update(user);
    } else {
      return this.save(user);
    }
  }
}
