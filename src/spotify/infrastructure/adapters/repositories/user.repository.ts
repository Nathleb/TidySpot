import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/spotify/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';

// In memory repo for local dev
@Injectable()
export class UserRepository extends UserRepositoryPort {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return Promise.resolve(user || null);
  }

  private async save(user: User): Promise<User> {
    const existingUser = this.users.find((u) => u.id === user.id);
    if (existingUser) {
      throw new Error(`User with Spotify ID ${user.id} already exists.`);
    }
    this.users.push(user);
    return Promise.resolve(user);
  }

  private async update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      throw new NotFoundException(`User with Spotify ID ${user.id} not found.`);
    }
    this.users[index] = user;
    return Promise.resolve(user);
  }

  private async delete(id: string): Promise<void> {
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    if (this.users.length === initialLength) {
      throw new NotFoundException(`User with Spotify ID ${id} not found.`);
    }
    return Promise.resolve();
  }

  async saveOrUpdate(user: User): Promise<User> {
    const existingUser = await this.findById(user.id);
    if (existingUser) {
      return this.update(user);
    } else {
      return this.save(user);
    }
  }
}
