import { DocumentCollection, EdgeCollection, SchemaOptions } from "arangojs/collection";
import { Room } from "modules/room/domain";

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