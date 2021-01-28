import { Container } from "inversify";
import { DomainEventEmitter } from "modules/common/DomainEventEmitter";
import { NotificationEvents } from "modules/notification/servicies/NotificationService";
import { RoomEvents } from "modules/room/servicies/RoomService";
import { pathToFileURL } from "url";
import { SocketIoWebsocketService } from "./platform/socketio/SocketIoWebsocketService";
import { WebsocketService } from "./servicies/WebsocketService";

export function registerSocketModule(container: Container, emitter: DomainEventEmitter, fileUrl: string) {
    container.bind(WebsocketService).to(SocketIoWebsocketService).inSingletonScope();

    emitter.on(NotificationEvents.NotificationAppendedEvent, (payload: NotificationEvents.NotificationAppendedEventPayload) => {
        const socket = container.get(WebsocketService);
        socket.publish(`notifications_${payload.notification.userId}`, payload.notification);
    });

    emitter.on(NotificationEvents.NotificationBroadcastedEvent, (payload: NotificationEvents.NotificationBroadcastedEventPayload) => {
        const socket = container.get(WebsocketService);

        socket.publish(`notifications`, {
            ...payload,
            excludedUserId: undefined
        }, [payload.excludedUserId]);
    });

    emitter.on(RoomEvents.RoomAddedEvent, (payload: RoomEvents.RoomAddedEventPayload) => {
        const socket = container.get(WebsocketService);
        socket.publish(`room`, {
            id: payload.roomId,
            name: payload.name,
            type: payload.type
        });
    });

    emitter.on(RoomEvents.MessagePostedEvent, (payload: RoomEvents.MessagePostedEventPayload) => {
        const socket = container.get(WebsocketService);
        socket.publish(`room_${payload.post.roomId}_posts`, {
            ...payload.post,
            attachementUrl: payload.post.attachementLocation ? `${fileUrl}/${payload.post.attachementLocation}` : undefined,
            createdBy: {
                id: payload.user.id,
                username: payload.user.username,
                photoUrl: payload.user.photoLocation ? `${fileUrl}/${payload.user.photoLocation}` : undefined
            }
        });
    });

    emitter.on(RoomEvents.MessageLikedEvent, (payload: RoomEvents.MessageLikedEventPayload) => {
        const socket = container.get(WebsocketService);
        socket.publish(`room_${payload.roomId}_likes`, {
            ...payload
        });
    });
}