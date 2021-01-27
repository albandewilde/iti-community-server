import { Bad, Ok, OkVal } from "modules/common";
import { UserRepository } from "../repositories/UserRepository";
import { sign } from "jsonwebtoken";
import * as bCrypt from "bcrypt";
import passport from "passport";
import { AuthenticationResponse } from "../domain/Authentication";
export type ChallengeAuthenticationResult =
    | OkVal<AuthenticationResponse>
    | Bad<"invalid_credentials">;

export class AuthenticationService {
    constructor(
        private tokenLifetime: number,
        private authSecret: string,
        private userRepo: UserRepository
    ) {
    }

    async challenge(username: string, password: string): Promise<ChallengeAuthenticationResult> {
        const user = await this.userRepo.findByUsername(username);
        if (!user) {
            return Bad("invalid_credentials");
        }

        const passwordMatches = await bCrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            return Bad("invalid_credentials");
        }
        const userInfo = {
            id: user.id,
            username: user.username
        };
        const token = sign(userInfo, this.authSecret, {
            expiresIn: this.tokenLifetime
        });

        return Ok({
            user: userInfo,
            bearer: {
                token,
                expiresAt: Date.now() + this.tokenLifetime * 1000
            }
        });
    }
}