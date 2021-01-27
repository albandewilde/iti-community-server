import { Container } from "inversify";
import { ArangoDbUserRepository } from "./platform/arangodb/ArangoDbUserRepository";
import { LocalFileStorage } from "./platform/local/LocalFileStorage";
import { UserRepository } from "./repositories/UserRepository";
import { AuthenticationService, UserService } from "./servicies";
import { FileStorage } from "./servicies/FileStorage";
import * as path from "path";
import { PictureService } from "./servicies/PictureService";
import { NodeSharpPictureService } from "./platform/sharp/NodeSharpPictureService";

export function registerUserModule(container: Container, tokenLifetime: number, authSecret: string) {
    container.bind(UserService).toSelf();
    container.bind(UserRepository).to(ArangoDbUserRepository);
    container.bind(PictureService).to(NodeSharpPictureService);
    container.bind(FileStorage).toConstantValue(new LocalFileStorage(path.resolve(__dirname, "../../../files")));
    container.bind(AuthenticationService).toConstantValue(new AuthenticationService(tokenLifetime, authSecret, container.get(UserRepository)));
}