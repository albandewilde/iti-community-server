import { User, UserInfo } from "./User";


export interface BearerToken {
    token: string;
    expiresAt: number;
}

export interface AuthenticationResponse {
    user: UserInfo;
    bearer: BearerToken;
}
