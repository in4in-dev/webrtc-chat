import { Server } from "socket.io";
import { createServer } from "http";

import {connectDatabase} from "./db";
import {Controller} from "./module/Chat";

let server = createServer();
let db = connectDatabase();

let socket = new Server(server, {
    path : '/',
    transports : ['websocket'],
    allowUpgrades : true,
    cors: {
        origin: "*"
    }
});

let controller = new Controller(socket);

console.log('Socket started');

server.listen(3000);