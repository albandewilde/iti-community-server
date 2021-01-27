require("dotenv").config();
import "reflect-metadata";

import * as bodyParser from 'body-parser';
import { InversifyExpressServer, } from 'inversify-express-utils';
import { config } from './config/env';
import { container } from './config/container';

import "./controllers";
import { registerDatabaseModule } from "modules/database";
import { registerUserModule } from "modules/user"
import { registerRoomModule } from "modules/room";
import * as passport from "passport";
import { BearerStrategy } from "./config/bearer";
import { FileRouter } from "./routes";
import { FileStorage } from "modules/user/servicies/FileStorage";
import { emitter } from "./config/emitter";
import { registerNotificationModule } from "modules/notification";
import { Socket } from "socket.io";
import { verify } from "jsonwebtoken";
import cors = require('cors');
import { WebsocketService } from "modules/socket/servicies/WebsocketService";
import { registerSocketModule } from "modules/socket";
import { UserInfo } from "modules/user/domain";

Promise.all([
    registerDatabaseModule(container, config.dbUrl, config.dbName),
    registerUserModule(container, 3600 * 24 * 365, config.authSecret),
    registerRoomModule(container),
    registerNotificationModule(container, emitter),
    registerSocketModule(container, emitter, config.filesUrl)

]).then(() => {
    passport.use(new BearerStrategy(config.authSecret));
    // create server
    let server = new InversifyExpressServer(container);
    server.setConfig((app) => {
        app.use(cors());
        // add body parser
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use(passport.initialize());
        app.use("/file", FileRouter(() => container.get(FileStorage)));
    });

    let app = server.build();
    let httpServer = require("http").Server(app);
    let io = require("socket.io")(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", function (socket: Socket) {
        const socketService = container.get(WebsocketService);
        const token = socket.handshake.auth["accessToken"];
        try {
            const user = verify(token, config.authSecret) as UserInfo;
            console.log(`-- new socket connection ${socket.id} for ${user.id} `);
            socketService.connect(socket, user.id);
           
            socket.on("subscribe", (msg)=> {
                socketService.subscribeTo(socket, user.id, msg.topic);
            });
            socket.on("unsubscribe", (msg)=> {
                socketService.unsubscribeTo(socket, user.id, msg.topic);
            });
            socket.on("disconnect", (reason) => {
                console.log(`-- ${socket.id} disconnected: ${reason}`);
                socketService.disconnect(socket, user.id);
            });
        } catch (e) {
            console.error(e);
        }
    });

    httpServer.listen(config.port, () => {
        console.info(`-- Server successfully started`);
        console.info(`-- Listening on ${config.port}`);
    });
}).catch(e => {
    console.error(e);
    process.exit(-1);
});
