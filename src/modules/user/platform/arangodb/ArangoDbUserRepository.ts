import { injectable } from "inversify";
import { ArangoDbConnection } from "modules/database/services";
import { User } from "modules/user/domain";
import { UserRepository } from "modules/user/repositories/UserRepository";

@injectable()
export class ArangoDbUserRepository extends UserRepository {

    constructor(
        private cnx: ArangoDbConnection
    ) {
        super();
    }

    async create(user: User): Promise<void> {
        await this.cnx.users.save({
            ...user,
            _key: user.id,
        });
    }

    async findById(id: string): Promise<User | null> {
        const result = await this.cnx.db.query(`
        for user in users 
        filter user._key == @id
        return {
            id: user._key,
            username: user.username,
            photoLocation: user.photoLocation,
            passwordHash: user.passwordHash
        }`, { id });
        const user = await result.next();
        return user || null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await this.cnx.db.query(`
        for user in users 
        filter user.username == @username
        return {
            id: user._key,
            username: user.username,
            photoLocation: user.photoLocation,
            passwordHash: user.passwordHash
        }`, { username });
        const user = await result.next();
        return user || null;
    }

    async update(user: { id: string, username?: string, photoLocation?: string }): Promise<void> {
        await this.cnx.db.query(`
        for user in users 
        update {
            _key: @id,
            ${user.username ? "username: @username," : ""}
            ${user.photoLocation ? "photoLocation: @photoLocation" : ""}
        } in users 
        `, { id: user.id, username: user.username, photoLocation: user.photoLocation });
    }

    async search(token: string): Promise<User[]> {
        const results = await this.cnx.db.query(`
        for user in users 
        filter FIND_FIRST(user.username, @token) >-1
        return user
        `, { token });

        return results.all();
    }
}