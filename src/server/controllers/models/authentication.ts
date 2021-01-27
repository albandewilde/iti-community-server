import { IsString, Matches } from "class-validator";
import { uernameRegex } from "./user";

export class LoginRequest {
    @IsString()
    @Matches(uernameRegex)
    username: string;

    @IsString()
    password: string;
}