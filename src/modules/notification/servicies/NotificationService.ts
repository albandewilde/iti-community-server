import { Notification } from "../domain";
import * as uuid from "uuid";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { DomainEventEmitter } from "modules/common/DomainEventEmitter";
import { injectable } from "inversify";

export namespace NotificationEvents {
    export const NotificationAppendedEvent = "notification_appended";
    export interface NotificationAppendedEventPayload {
        notification: Notification;
    }

    export const NotificationBroadcastedEvent = "notification_broadcasted";
    export interface NotificationBroadcastedEventPayload {
        id: string;
        excludedUserId: string;
        timestamp: number;
        subject: string;
        payload: any;
    }
}

@injectable()
export class NotificationService {
    constructor(
        private notificationRepo: NotificationRepository,
        private emitter: DomainEventEmitter
    ) {
    }

    async notify(userId: string, subject: string, payload: any) {
        const notification = {
            id: uuid.v4(),
            timestamp: Date.now(),
            excludedUserId: userId,
            subject,
            payload
        };

        await this.notificationRepo.addMany(notification, userId);

        this.emitter.emit(NotificationEvents.NotificationBroadcastedEvent, {
            ...notification
        } as NotificationEvents.NotificationBroadcastedEventPayload);

        return notification;
    }

    async append(userId: string, subject: string, payload: any): Promise<Notification> {
        const notification: Notification = {
            id: uuid.v4(),
            userId,
            timestamp: Date.now(),
            subject,
            payload
        };

        await this.notificationRepo.add(notification);

        this.emitter.emit(NotificationEvents.NotificationAppendedEvent, {
            notification
        } as NotificationEvents.NotificationAppendedEventPayload);

        return notification;
    }

    async view(userId: string): Promise<void> {
        return this.notificationRepo.markAsViewed(userId, new Date());
    }
}