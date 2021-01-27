import { DocumentCollection, EdgeCollection, SchemaOptions } from "arangojs/collection";
import { Room, RoomType } from "modules/room/domain";
import * as uuid from "uuid";

export type RoomCollection = DocumentCollection<Room> & EdgeCollection<Room>;

export const RoomCollectionSchema: SchemaOptions = {
    rule: {
        properties: {
            id: { "type": "string" },
            name: { "type": "string" },
            type: { "type": "string" }
        },
        required: ["id"]
    },
    level: "strict",
}

export const RoomCollectionIndexes: [string[], boolean][] = [
    [["id"], true],
    [["type"], false],
];

export async function initializeRoomCollection(collection: RoomCollection) {
    await collection.save({
        _key: uuid.v4(),
        id: uuid.v4(),
        name: "Général",
        type: RoomType.Text
    })
}