import { injectable } from "inversify";
import { User } from "modules/user/domain";

@injectable()
export abstract class UserRepository {
    abstract create(user: User): Promise<void>;
    abstract update(user: { id: string, username?: string, photoLocation?: string }): Promise<void>;
    abstract findById(id: string): Promise<User | null>;
    abstract findByUsername(username: string): Promise<User | null>;
    abstract search(token: string): Promise<User[]>;
}
