export interface Post {
    id: string;
    roomId: string;
    createdAt: number;
    createdBy: string;
    message: string;

    attachementLocation?: string;
}

export interface Like {
    userId: string;
    postId: string;
    createdAt: number;
}