import { Request } from "express";
import { controller, interfaces, httpGet, httpPost, httpPut, BaseHttpController, } from "inversify-express-utils";
import { UserRepository } from "modules/user/repositories/UserRepository";
import { UserService } from "modules/user/servicies/UserService";
import { UserInfo } from "modules/user/domain";
import { authorize, readUserId } from "../config/bearer";
import { Ignore, validateBody, validateQuery } from "modules/common/validator";
import { multipart, UploadedFile } from "modules/common/upload";
import { config } from "server/config/env";
import {RegisterUserRequest, UpdateUserRequest, UserExistsRequest, UserResult, UserSearchRequest} from "./models/user";


@controller("/user")
export class UserController extends BaseHttpController {
    constructor(
        private userService: UserService,
        private userRepo: UserRepository
    ) {
        super();
    }

    @httpPost("/", validateBody(RegisterUserRequest))
    async register(req: Request) {
        const result = await this.userService.register(req.body.username, req.body.password);
        if (!result.success) {
            return this.badRequest(result.reason);
        }
    }

    @httpPut("/", authorize(), multipart(), validateBody(UpdateUserRequest))
    async update(req: Request) {
        await this.userService.update(readUserId(req), req.body);
        return this.getUserInfo(req);
    }

    @httpGet("/exists", validateQuery(UserExistsRequest))
    async userExists(req: Request): Promise<boolean> {
        const query = req.query as any as UserExistsRequest;
        const user = await this.userRepo.findByUsername(query.username);
        return !!user;
    }

    @httpGet("/search", authorize(), validateQuery(UserSearchRequest))
    async userSearch(req: Request) {
        const query = req.query as any as UserSearchRequest;
        const users = await this.userRepo.search(query.search);
        return users.map(usr => {
            return {
                id: usr.id,
                username: usr.username,
                photoUrl: usr.photoLocation ? `${config.filesUrl}/${usr.photoLocation}` : undefined
            }
        });
    }

    @httpGet("/", authorize())
    async getUserInfo(req: Request): Promise<UserResult> {
        const userId = readUserId(req);
        const user = await this.userRepo.findById(userId);

        if (!user) {
            throw new Error("Could not found user");
        }

        return {
            id: user.id,
            username: user.username,
            photoUrl: user.photoLocation ? `${config.filesUrl}/${user.photoLocation}` : undefined
        }
    }
}
