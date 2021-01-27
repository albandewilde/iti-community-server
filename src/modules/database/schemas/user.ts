import { User } from "modules/user/domain";
import { DocumentCollection, EdgeCollection, SchemaOptions } from "arangojs/collection";

export type UserCollection = DocumentCollection<User> & EdgeCollection<User>;

export const UserCollectionSchema: SchemaOptions = {
    rule: {
        properties: {
            id: { "type": "string" },
            username: { "type": "string" },
            passwordHash: { "type": "string" },
            photoLocation: { "type": "string" },
        },
        required: ["id", "username", "passwordHash"]
    },
    level: "strict",
};

export const UserCollectionIndexes: [string[], boolean][] = [
    [["id"], true],
    [["username"], true],
];