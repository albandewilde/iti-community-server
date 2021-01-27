import { injectable } from "inversify";
import { UserInfo } from "modules/user/domain";
import { StrategyEnum } from "sharp";
import { Room } from "../domain";
import { Post } from "../domain/Post";

export interface PostMessage {
    id: string;
    roomId: string;
    createdAt: number;
    createdBy: {
        id: string;
        username: string;
        photoLocation?: string;
    };
    message: string;
    attachementLocation?: string;
}

@injectable()
export abstract class RoomRepository {
    abstract add(room: Room): Promise<void>;
    abstract findById(roomId: string): Promise<Room | null>;
    abstract post(post: Post): Promise<void>;
    abstract getAllRooms(): Promise<Room[]>;
    abstract getMessages(userId: string, roomId: string, skip: number, take: number): Promise<PostMessage[]>;
    abstract findMessage(postId: string): Promise<Post | null>;

    abstract likeMessage(userId: string, postId: string, date: Date): Promise<void>;
}
