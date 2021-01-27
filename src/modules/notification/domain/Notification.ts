import { Transform } from "stream";

export interface Notification<T = any> {
    id: string;
    userId: string;
    viewedAt?: number;
    timestamp: number;
    subject: string;
    payload: T;
}