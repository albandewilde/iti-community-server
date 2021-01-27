import { Container } from "inversify";
import { DomainEventEmitter } from "modules/common/DomainEventEmitter";
import { RoomRepository } from "modules/room/repositories/RoomRepository";
import { RoomEvents } from "modules/room/servicies/RoomService";
import { UserRepository } from "modules/user/repositories/UserRepository";
import { UserEvents } from "modules/user/servicies";
import { ArangoDbNotificationRepository } from "./platform/arangodb/ArangoDbNotificationRepository";
import { NotificationRepository } from "./repositories/NotificationRepository";
import { NotificationService } from "./servicies/NotificationService";

export function registerNotificationModule(container: Container, emitter: DomainEventEmitter) {
    container.bind(NotificationService).toSelf();
    container.bind(NotificationRepository).to(ArangoDbNotificationRepository);

    emitter.on(RoomEvents.RoomAddedEvent, async (payload: RoomEvents.RoomAddedEventPayload) => {
        const notifService = container.get(NotificationService);
        const userRepo = container.get(UserRepository);
        const user = await userRepo.findById(payload.userId);

        if (!user) {
            throw new Error('User not found');
        }

        await notifService.notify(payload.userId, "room_added", {
            user: {
                id: user.id,
                username: user.username,
                photoLocation: user.photoLocation
            },
            room: {
                id: payload.roomId,
                name: payload.name
            }
        });
    });

    emitter.on(RoomEvents.MessageLikedEvent, async (payload: RoomEvents.MessageLikedEventPayload) => {
        const notifService = container.get(NotificationService);
        const roomRepo = container.get(RoomRepository);
        const userRepo = container.get(UserRepository);
        const post = await roomRepo.findMessage(payload.postId);

        if (!post) {
            throw new Error("Post not found");
        }

        if (payload.userId === post.createdBy) {
            return;
        }

        const user = await userRepo.findById(payload.userId);
        if (!user) {
            throw new Error("User not found");
        }

        await notifService.append(post.createdBy, "post_liked", {
            postId: post.id,
            preview: post.message.substr(0, 128),
            user: {
                id: user.id,
                username: user.username,
                photoLocation: user.photoLocation
            }
        });
    });

    emitter.on(UserEvents.UserRegisteredEvent, async (payload: UserEvents.UserRegisteredEventPayload) => {
        const notifService = container.get(NotificationService);

        await notifService.notify(payload.id, "new_user", {
            user: payload
        });
    });
}
