import { injectable } from "inversify";

@injectable()
export abstract class WebsocketService<T> {
    abstract connect(cnx: T, userId: string,): void;
    abstract disconnect(cnx: T, userId: string): void;
    abstract subscribeTo(cnx: T, userId: string, topic: string): Promise<any>;
    abstract unsubscribeTo(cnx: T, userId: string, topic: string): Promise<any>;
    abstract publish<T>(topic: string, message: T, blacklist?: string[]): Promise<void>;
}
