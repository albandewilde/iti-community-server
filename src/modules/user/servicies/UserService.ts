import * as bCrypt from "bcrypt";
import * as fs from "fs-extra";
import * as uuid from "uuid";
import * as path from "path";
import { injectable } from "inversify";
import { UploadedFile } from "modules/common/upload";
import { UserRepository } from "../repositories/UserRepository";
import { FileStorage } from "./FileStorage";
import { PictureService } from "./PictureService";
import { Bad, Ok, OkVal } from "modules/common";
import { User } from "../domain";
import { DomainEventEmitter } from "modules/common/DomainEventEmitter";

export type RegistrationResult =
    | OkVal<User>
    | Bad<"username_taken">
    ;

export namespace UserEvents {
    export const UserRegisteredEvent = "user_registered";
    export interface UserRegisteredEventPayload {
        id: string;
        username: string;
    }
}

@injectable()
export class UserService {
    constructor(
        private userRepo: UserRepository,
        private fileStorage: FileStorage,
        private pictureService: PictureService,
        private emitter: DomainEventEmitter
    ) { }

    async register(username: string, password: string): Promise<RegistrationResult> {
        username = this.normalizeUsername(username);
        const exists = await this.userRepo.findByUsername(username);
        if (exists) {
            return Bad("username_taken");
        }
        const passwordHash = await bCrypt.hash(password, 10);
        const user = {
            id: uuid.v4(),
            username,
            passwordHash
        };
        await this.userRepo.create(user);

        this.emitter.emit(UserEvents.UserRegisteredEvent, {
            id: user.id,
            username
        } as UserEvents.UserRegisteredEventPayload);

        return Ok(user);
    }

    async update(id: string, user: { username?: string, photo?: UploadedFile }) {
        let photoLocation: string | undefined;
        if (user.photo) {
            if (this.pictureService.isFileSupported(user.photo.type)) {
                const [picStream] = this.pictureService.resize(fs.createReadStream(user.photo.path), { width: 512, height: 512 });
                photoLocation = `photos/${id}${path.extname(user.photo.name)}`;
                await this.fileStorage.save(photoLocation, picStream);
            }
        }

        await this.userRepo.update({
            id,
            username: user.username,
            photoLocation
        });
    }

    normalizeUsername(username: string): string {
        return username.trim().toLocaleLowerCase();
    }
}