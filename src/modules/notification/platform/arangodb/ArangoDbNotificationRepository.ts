import { injectable } from "inversify";
import { ArangoDbConnection } from "modules/database/services";
import { Notification } from "modules/notification/domain";
import { NotificationRepository } from "modules/notification/repositories/NotificationRepository";

@injectable()
export class ArangoDbNotificationRepository extends NotificationRepository {

    constructor(
        private cnx: ArangoDbConnection
    ) {
        super();
    }

    async addMany(notification: Omit<Notification, 'userId'>, except: string): Promise<void> {
        await this.cnx.db.query(`
        for user in users
        filter user.id != @userId
        insert {
            id: @notification.id,
            userId: user.id,
            timestamp: @notification.timestamp,
            subject: @notification.subject,
            payload: @notification.payload
        } into notifications 
        `, { userId: except, notification });
    }

    async add(notification: Notification<any>): Promise<void> {
        await this.cnx.notifications.save({
            ...notification,
            _key: notification.id,
        });
    }

    async markAsViewed(userId: string, viewDate: Date): Promise<void> {
        await this.cnx.db.query(`
        for notif in notifications
        filter notif.userId == @userId and notif.timestamp <= @viewDate
        update notif with {
          viewedAt: @viewDate
        } in notifications 
        `, { viewDate: +viewDate, userId });
    }

    async get(userId: string, skip: number, take: number): Promise<Notification<any>[]> {
        const result = await this.cnx.db.query(`
        for notif in notifications

        filter notif.userId == @userId
        limit @skip, @take
        return {
            id: notif._key,
            timestamp: notif.timestamp,
            subject: notif.subject,
            payload: notif.payload,
            viewedAt: notif.viewedAt
        }`, { userId, skip, take });

        return result.all();
    }
}