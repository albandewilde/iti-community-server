import { DocumentCollection, EdgeCollection, SchemaOptions } from "arangojs/collection";
import { Notification } from "modules/notification/domain";

export type NotificationCollection = DocumentCollection<Notification> & EdgeCollection<Notification>;

export const NotificationCollectionSchema: SchemaOptions = {
    rule: {
        properties: {
            id: { "type": "string" },
            userId: { "type": "string" },
            timestamp: { "type": "number" },
            subject: { "type": "string" },
            payload: { "type": "object" },
            viewedAt: { "type": "number" },

        },
        required: ["id", "userId", "timestamp", "subject", "payload"]
    },
    level: "strict",
};

export const NotificationCollectionIndexes: [string[], boolean][] = [
    [["id", "userId"], true],
    [["timestamp"], false],
    [["subject"], false],
    [["viewedAt"], false],
];