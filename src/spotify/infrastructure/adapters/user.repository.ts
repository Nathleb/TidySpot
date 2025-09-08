import { Injectable } from "@nestjs/common";
import { User } from "src/spotify/domain/entities/user.entity";
import { UserRepositoryPort } from "src/spotify/domain/ports/user-repository.port";

@Injectable()
export class UserRepository extends UserRepositoryPort {
    findBySpotifyId(spotifyId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    save(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    update(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    delete(spotifyId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}