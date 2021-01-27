import { Request } from "express";
import { BaseHttpController, controller, httpGet, httpPost } from "inversify-express-utils";
import { validateQuery } from "modules/common/validator";
import { NotificationRepository } from "modules/notification/repositories/NotificationRepository";
import { NotificationService } from "modules/notification/servicies/NotificationService";
import { authorize, readUser, readUserId } from "server/config/bearer";
import { config } from "server/config/env";
import { PaginatedQuery } from "./models/common";

@controller("/notification", authorize())
export class NotificationController extends BaseHttpController {
    constructor(
        private notificationService: NotificationService,
        private notificationRepo: NotificationRepository
    ) {
        super();
    }

    @httpPost("/")
    view(req: Request) {
        return this.notificationService.view(readUserId(req));
    }

    @httpGet("/", validateQuery(PaginatedQuery))
    async get(req: Request) {
        const query = req.query as any as PaginatedQuery;
        const notifications = await this.notificationRepo.get(readUserId(req), query.skip, query.take);
        return notifications.map(notif => {
            const user = notif.payload.user;
            if (user && user.photoLocation) {
                user.photoUrl = `${config.filesUrl}/${user.photoLocation}`;
                user.photoLocation = undefined;
            }

            return notif;
        })
    }
}