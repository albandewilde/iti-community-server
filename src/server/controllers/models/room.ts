import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { UploadedFile } from "modules/common/upload";
import { Ignore, TryParseNumber } from "modules/common/validator";
import { RoomType } from "modules/room/domain";

export class AddRoomRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(RoomType)
    type: RoomType;
}


export class PostMessageRequest {
    @IsString()
    message: string;

    @Ignore()
    file?: UploadedFile;
}


