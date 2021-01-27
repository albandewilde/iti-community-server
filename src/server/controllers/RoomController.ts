import { Request } from "express";
import { BaseHttpController, controller, httpGet, httpPost, httpPut, results } from "inversify-express-utils";
import { multipart } from "modules/common/upload";
import { validateBody, validateQuery } from "modules/common/validator";
import { PostMessage, RoomRepository } from "modules/room/repositories/RoomRepository";
import { RoomService } from "modules/room/servicies/RoomService";
import { authorize, readUserId } from "server/config/bearer";
import { config } from "server/config/env";
import { PaginatedQuery } from "./models/common";
import { AddRoomRequest, PostMessageRequest } from "./models/room";

@controller("/room", authorize())
export class RoomController extends BaseHttpController {
    constructor(
        private roomService: RoomService,
        private roomRepo: RoomRepository,
    ) {
        super();
    }

    @httpPost("/", validateBody(AddRoomRequest))
    async add(req: Request) {
        const body = req.body as AddRoomRequest;
        return this.roomService.add(body.name, body.type, readUserId(req));
    }

    @httpGet("/")
    async getAll() {
        return this.roomRepo.getAllRooms();
    }

    @httpPost("/:roomId/post", multipart(), validateBody(PostMessageRequest))
    async postMessage(req: Request) {
        const body = req.body as PostMessageRequest;
        const result = await this.roomService.postMessage({
            roomId: req.params.roomId,
            userId: readUserId(req),
            message: body.message,
            file: body.file
        });

        if (!result.success) {
            return this.badRequest(result.reason);
        }

        return this.ouputMessege({
            ...result.value.post,
            createdBy: {
                id: result.value.user.id,
                username: result.value.user.username,
                photoLocation: result.value.user.photoLocation
            }
        });
    }

    @httpGet("/:roomId/post", validateQuery(PaginatedQuery))
    async getMessage(req: Request) {
        const query = req.query as any as PaginatedQuery;
        const messages = await this.roomRepo.getMessages(readUserId(req), req.params.roomId, query.skip, query.take);
        return messages.map(this.ouputMessege);
    }

    @httpPost("/:roomId/post/:postId/like")
    async likeMessage(req: Request) {
        return this.roomService.likeMessage(readUserId(req), req.params.roomId, req.params.postId);
    }

    private ouputMessege(msg: PostMessage) {
        return {
            ...msg,
            createdBy: {
                ...msg.createdBy,
                photoUrl: msg.createdBy.photoLocation ? `${config.filesUrl}/${msg.createdBy.photoLocation}` : undefined,
                photoLocation: undefined
            },
            attachementUrl: msg.attachementLocation ? `${config.filesUrl}/${msg.attachementLocation}` : undefined,
        };
    }
}
