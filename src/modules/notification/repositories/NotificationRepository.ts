import { injectable } from "inversify";
import { Notification } from "../domain";

@injectable()
export abstract class NotificationRepository {
    abstract add(notification: Notification): Promise<void>;
    abstract addMany(notification: Omit<Notification, 'userId'>, except: string): Promise<void>;
    abstract markAsViewed(userId: string, viewDate: Date): Promise<void>;
    abstract get(userId: string, skip: number, take: number): Promise<Notification[]>
}