import { inject, injectable } from "inversify";
import { WebsocketService } from "modules/socket/servicies/WebsocketService";
import { Socket } from "socket.io";

@injectable()
export class SocketIoWebsocketService extends WebsocketService<Socket> {
    private connections: Set<Socket> = new Set();
    private userConnections: Map<string, Socket[]> = new Map();
    private subscriptions: Map<string, Socket[]> = new Map();

    constructor() {
        super()
    }

    connect(cnx: Socket, userId: string): void {
        this.connections.add(cnx);
        const connections = this.userConnections.get(userId) || [];
        connections.push(cnx);
        this.userConnections.set(userId, connections);
    }

    disconnect(cnx: Socket, userId: string): void {
        const connections = this.userConnections.get(userId);
        if (connections) {
            const idx = connections.indexOf(cnx);
            if (idx > -1) {
                connections.splice(idx, 1);
            }

            this.connections.delete(cnx);
        }
    }

    async subscribeTo(cnx: Socket, userId: string, topic: string): Promise<any> {
        const connections = this.subscriptions.get(topic) || [];
        connections.push(cnx);
        this.subscriptions.set(topic, connections);
    }

    async unsubscribeTo(cnx: Socket, userId: string, topic: string): Promise<any> {
        const connections = this.subscriptions.get(topic) || [];
        const idx = connections.indexOf(cnx);

        if (idx > -1) {
            connections.splice(idx, 1);
            this.subscriptions.set(topic, connections);
        }
    }

    async publish<T>(topic: string, message: T, blacklist: string[] = []): Promise<void> {
        const connections = this.subscriptions.get(topic);
        if (!connections) {
            return;
        }

        const blacklistedCnx = new Set<Socket>();
        blacklist.forEach(userId => {
            const connections = this.userConnections.get(userId);
            if (connections) {
                connections.forEach(c => {
                    blacklistedCnx.add(c);
                });
            }
        });

        let deletedConnections: Socket[] = [];
        for (let cnx of connections) {
            if (blacklistedCnx.has(cnx)) {
                continue;
            }

            if (this.connections.has(cnx)) {
                cnx.emit(topic, message);
            } else {
                deletedConnections.push(cnx);
            }
        }

        for (let cnx of deletedConnections) {
            connections.splice(connections.indexOf(cnx), 1);
        }
    }
}