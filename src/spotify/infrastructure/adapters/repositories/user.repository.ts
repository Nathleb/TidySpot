import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { User } from 'src/spotify/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';

@Injectable()
export class UserRepository extends UserRepositoryPort implements OnModuleInit {
  private users: User[] = [];
  private readonly filePath = join(process.cwd(), 'data', 'users.json');

  async onModuleInit() {
    await this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });

      const data = await fs.readFile(this.filePath, 'utf8');
      this.users = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty array
        this.users = [];
        await this.persistUsers();
      } else {
        throw error;
      }
    }
  }

  private async persistUsers(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.users, null, 2));
  }

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
    await this.persistUsers();
    return Promise.resolve(user);
  }

  private async update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      throw new NotFoundException(`User with Spotify ID ${user.id} not found.`);
    }
    this.users[index] = user;
    await this.persistUsers();
    return Promise.resolve(user);
  }

  private async delete(id: string): Promise<void> {
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    if (this.users.length === initialLength) {
      throw new NotFoundException(`User with Spotify ID ${id} not found.`);
    }
    await this.persistUsers();
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
