import { DocumentCollection, EdgeCollection, SchemaOptions } from "arangojs/collection";
import { Post } from "modules/room/domain/Post";

export type PostCollection = DocumentCollection<Post> & EdgeCollection<Post>;

export const PostCollectionSchema: SchemaOptions = {
    rule: {
        properties: {
            id: { "type": "string" },
            roomId: { "type": "string" },
            createdAt: { "type": "number" },
            createdBy: { "type": "string" },
            message: { "type": "string" },
            attachementLocation: { "type": "string" },
        },
        required: ["id", "roomId", "createdAt", "createdBy", "message"]
    },
    level: "strict",
}

export const PostCollectionIndexes: [string[], boolean][] = [
    [["id"], true],
    [["roomId"], false],
    [["createdAt"], false],
    [["createdBy"], false],
];
