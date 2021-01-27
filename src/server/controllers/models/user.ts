import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { UploadedFile } from "modules/common/upload";
import { Ignore } from "modules/common/validator";
import { UserInfo } from "modules/user/domain";

export interface UserResult extends UserInfo {
    photoUrl?: string;
}

export const uernameRegex = /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9]$/;
export const passwordRegex = /^\S+$/;

export class RegisterUserRequest {
    @IsString()
    @Matches(uernameRegex)
    username: string;

    @IsString()
    password: string;
}

export class UpdateUserRequest {
    @IsString()
    @IsOptional()
    username?: string;

    @Ignore()
    photo?: UploadedFile;
}

export class UserExistsRequest {
    @IsString()
    @IsNotEmpty()
    username: string;
}

export class UserSearchRequest {
    @IsString()
    @IsNotEmpty()
    search: string;
}