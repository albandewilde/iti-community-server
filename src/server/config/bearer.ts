import { Strategy } from "passport-http-bearer";
import { verify } from "jsonwebtoken";
import { UserInfo } from "modules/user/domain";
import { NextFunction, Request, Response } from "express";
import * as passport from "passport";

export class BearerStrategy extends Strategy<any> {
    constructor(
        private secret: string
    ) {
        super(async (token: string, done: (error: any, user?: UserInfo) => void) => {
            try {
                const identity = verify(token, this.secret) as UserInfo | undefined;
                if (identity) {
                    done(null, identity);
                }
                else {
                    done(null);
                }
            }
            catch (e) {
                done(null);
            }
        });
    }
}

export function authorize() {
    return function (req: Request, res: Response, next: NextFunction) {
        passport.authenticate("bearer", { session: false })(req, res, next);
    }
}

export function readUser(req: Request, ) {
    if (!req["user"]) {
        throw new Error("User not authorized");
    }
    return req["user"] as UserInfo;
}

export function readUserId(req: Request) {
    const user = readUser(req);
    return user.id;
}
