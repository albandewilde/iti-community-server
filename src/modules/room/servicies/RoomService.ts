import * as uuid from "uuid";
import * as fs from "fs-extra";
import * as path from "path";
import { injectable } from "inversify";
import { Room, RoomType } from "../domain";
import { PostMessage, RoomRepository } from "../repositories/RoomRepository";
import { UploadedFile } from "modules/common/upload";
import { Bad, Ok } from "modules/common";
import { Post } from "../domain/Post";
import { UserRepository } from "modules/user/repositories/UserRepository";
import { PictureService } from "modules/user/servicies/PictureService";
import { FileStorage } from "modules/user/servicies/FileStorage";
import { DomainEventEmitter } from "modules/common/DomainEventEmitter";
import { User } from "modules/user/domain";

export namespace RoomEvents {
    export const RoomAddedEvent = "room_added";
    export interface RoomAddedEventPayload {
        roomId: string;
        userId: string;
        type: string;
        name: string;
    }

    export const MessagePostedEvent = "message_posted";
    export interface MessagePostedEventPayload {
        post: Post;
        user: User;
    }

    export const MessageLikedEvent = "message_liked";
    export interface MessageLikedEventPayload {
        userId: string;
        postId: string
        roomId: string
    }
}

@injectable()
export class RoomService {
    constructor(
        private roomRepo: RoomRepository,
        private userRepository: UserRepository,
        private pictureService: PictureService,
        private fileStorage: FileStorage,
        private emitter: DomainEventEmitter
    ) {
    }

    async add(name: string, type: RoomType, userId: string): Promise<Room> {
        const room: Room = {
            id: uuid.v4(),
            name,
            type
        }

        this.roomRepo.add(room);

        this.emitter.emit(RoomEvents.RoomAddedEvent, {
            roomId: room.id,
            name: room.name,
            type,
            userId
        } as RoomEvents.RoomAddedEventPayload);

        return room;
    }

    async postMessage(incomingPost: {
        userId: string,
        roomId: string,
        message: string,
        file?: UploadedFile
    }) {
        const room = await this.roomRepo.findById(incomingPost.roomId);
        if (!room) {
            return Bad("room_not_found");
        }

        const user = await this.userRepository.findById(incomingPost.userId);
        if (!user) {
            return Bad("user_not_found");
        }

        const post: Post = {
            id: uuid.v4(),
            roomId: room.id,
            createdBy: user.id,
            createdAt: Date.now(),
            message: incomingPost.message
        }

        if (incomingPost.file) {
            const fileLocation = `messages/${incomingPost.roomId}_${incomingPost.userId}_${Date.now()}${path.extname(incomingPost.file.name)}`;
            const readStream = fs.createReadStream(incomingPost.file.path);

            if (this.pictureService.isFileSupported(incomingPost.file.type)) {
                const [picStream] = this.pictureService.resize(readStream, { width: 800 });
                await this.fileStorage.save(fileLocation, picStream);
            } else {
                await this.fileStorage.save(fileLocation, readStream);
            }

            post.attachementLocation = fileLocation;
        }

        this.emitter.emit(RoomEvents.MessagePostedEvent, {
            post,
            user
        } as RoomEvents.MessagePostedEventPayload);

        await this.roomRepo.post(post);

        return Ok({ post, user });
    }

    async likeMessage(userId: string, roomId: string, postId: string): Promise<void> {
        await this.roomRepo.likeMessage(userId, postId, new Date());
        this.emitter.emit(RoomEvents.MessageLikedEvent, {
            userId,
            postId,
            roomId
        } as RoomEvents.MessageLikedEventPayload);
    }
}
