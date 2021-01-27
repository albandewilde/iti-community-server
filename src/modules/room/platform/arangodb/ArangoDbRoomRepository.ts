import { injectable } from "inversify";
import { ArangoDbConnection } from "modules/database/services";
import { Room } from "modules/room/domain";
import { Post } from "modules/room/domain/Post";
import { RoomRepository } from "modules/room/repositories/RoomRepository";

@injectable()
export class ArangoDbRoomRepository extends RoomRepository {


    constructor(
        private cnx: ArangoDbConnection
    ) {
        super();
    }

    async add(room: Room): Promise<void> {
        await this.cnx.rooms.save({
            ...room,
            _key: room.id,
        });
    }

    async findById(roomId: string): Promise<Room | null> {
        const result = await this.cnx.db.query(`
            for room in rooms 
            filter room._key == @id
            return {
                id: room._key,
                name: room.name,
                type: room.type
            }`, { id: roomId });
        const room = await result.next();
        return room || null;
    }

    async findMessage(postId: string): Promise<Post | null> {
        const result = await this.cnx.db.query(`
            for post in posts 
            filter post._key == @id
            return post`, { id: postId });
        const post = await result.next();
        return post || null;
    }

    async post(post: Post): Promise<void> {
        await this.cnx.posts.save({
            ...post,
            _key: post.id,
        });
    }

    async getMessages(userId: string, roomId: string, skip: number, take: number) {
        const result = await this.cnx.db.query(`
        for post in posts 

        let user = DOCUMENT("users", post.createdBy)
        let p_like = FIRST(
            FOR l IN likes
            FILTER l._from == @userId and l._to == post._id 
            RETURN l
       )

        filter post.roomId == @roomId
        limit @skip, @take
        return {
            id: post._key,
            message: post.message,
            roomId : post.roomId,
            createdBy: {
                id: user.id,
                username: user.username,
                photoLocation: user.photoLocation
            },
            createdAt: post.createdAt,
            liked: p_like == null ? false : true,
            attachementLocation: post.attachementLocation
        }`, { roomId, userId: `users/${userId}`, skip, take });

        return result.all();
    }

    async getAllRooms(): Promise<Room[]> {
        const result = await this.cnx.db.query(`
        for room in rooms 
        return {
            id: room._key,
            name: room.name,
            type: room.type
        }`);
        return result.all();
    }

    async likeMessage(userId: string, postId: string, date: Date): Promise<void> {
        const likedResult = await this.cnx.db.query(`
        for l in likes
        filter l._from == @userId and l._to == @postId
        return true`, {
            userId: `users/${userId}`,
            postId: `posts/${postId}`
        });

        const alreadyLiked = await likedResult.next() || false;

        if (!alreadyLiked) {
            await this.cnx.likes.save({
                createdAt: date.getTime(),
                _from: `users/${userId}`,
                _to: `posts/${postId}`
            });
        }
    }
}
