import { IsString } from "class-validator";
import { Request } from "express";
import { controller, httpGet, httpPost, interfaces } from "inversify-express-utils";
import { validateBody } from "modules/common/validator";
import { AuthenticationService, UserService } from "modules/user/servicies";
import { LoginRequest } from "./models/authentication";


@controller("/auth")
export class AuthenticationController implements interfaces.Controller {
    constructor(
        private authService: AuthenticationService,
        private userService: UserService

    ) {
    }

    @httpPost("/login", validateBody(LoginRequest))
    login(req: Request) {
        const username = this.userService.normalizeUsername(req.body.username);
        return this.authService.challenge(username, req.body.password);
    }
}
