import { Container } from "inversify";
import { ArangoDbRoomRepository } from "./platform/arangodb/ArangoDbRoomRepository";
import { RoomRepository } from "./repositories/RoomRepository";
import { RoomService } from "./servicies/RoomService";


export function registerRoomModule(container: Container) {
    container.bind(RoomService).toSelf();
    container.bind(RoomRepository).to(ArangoDbRoomRepository);
}