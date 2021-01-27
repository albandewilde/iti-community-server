import { CollectionType, DocumentCollection, EdgeCollection, SchemaOptions } from "arangojs/collection";

export interface LikeDataModel {
    createdAt: number;
}
export type LikeCollection = DocumentCollection<LikeDataModel> & EdgeCollection<LikeDataModel>;

export const LikeCollectionSchema: SchemaOptions & {
    type?: CollectionType;
} = {
    type: CollectionType.EDGE_COLLECTION,
    rule: {
        properties: {
            createdAt: { "type": "number" }
        },
        required: ["createdAt"]
    },
    level: "strict",
}


export const LikeCollectionIndexes: [string[], boolean][] = [
    [["createdAt"], false],
    [["_from", "_to"], true],
];
