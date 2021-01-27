import { Database, CollectionType, aql } from "arangojs";
import { DocumentCollection, EdgeCollection, SchemaOptions } from "arangojs/collection";
import { LikeCollection, LikeCollectionIndexes, LikeCollectionSchema } from "../schemas/like";
import { NotificationCollection, NotificationCollectionIndexes, NotificationCollectionSchema } from "../schemas/notification";
import { PostCollection, PostCollectionIndexes, PostCollectionSchema } from "../schemas/post";
import { initializeRoomCollection, RoomCollection, RoomCollectionIndexes, RoomCollectionSchema } from "../schemas/room";
import { UserCollection, UserCollectionIndexes, UserCollectionSchema } from "../schemas/user";

export class ArangoDbConnection {
    db: Database;
    users: UserCollection;
    rooms: RoomCollection;
    posts: PostCollection;
    notifications: NotificationCollection;
    likes: LikeCollection;

    constructor(dbUrl: string, private dbName: string) {
        this.db = new Database(dbUrl);
    }

    async initialize() {
        const db = this.db.database(this.dbName);
        if (!await db.exists()) {
            this.db = await this.db.createDatabase(this.dbName);
        } else {
            this.db = db;
        }

        this.users = this.db.collection("users");
        await this.initializeCollection(this.users, UserCollectionSchema, UserCollectionIndexes);

        this.rooms = this.db.collection("rooms");
        await this.initializeCollection(this.rooms, RoomCollectionSchema, RoomCollectionIndexes, initializeRoomCollection);

        this.posts = this.db.collection("posts");
        await this.initializeCollection(this.posts, PostCollectionSchema, PostCollectionIndexes);

        this.notifications = this.db.collection("notifications");
        await this.initializeCollection(this.notifications, NotificationCollectionSchema, NotificationCollectionIndexes);

        this.likes = this.db.collection("likes");
        await this.initializeCollection(this.likes, LikeCollectionSchema, LikeCollectionIndexes);
    }

    async initializeCollection(collection: DocumentCollection & EdgeCollection, schema: SchemaOptions & {
        type?: CollectionType;
    }, indexes: [string[], boolean][] = [], afterCreate?: (collection: DocumentCollection & EdgeCollection) => any) {
        if (!await collection.exists()) {
            await collection.create({
                schema,
                type: schema.type
            });
            await Promise.all(indexes.map(async idx => {
                return collection.ensureIndex({
                    type: "persistent",
                    unique: idx[1],
                    fields: idx[0]
                })
            }));
            if (afterCreate) {
                await afterCreate(collection);
            }
        }
    }
}