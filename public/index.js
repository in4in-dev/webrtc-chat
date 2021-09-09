"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const ClientActions_1 = __importDefault(require("./consts/ClientActions"));
const models_1 = require("./models");
const ServerActions_1 = __importDefault(require("./consts/ServerActions"));
const ClientStore_1 = require("./module/ClientStore");
const Client_1 = require("./module/Client");
const models_2 = require("./models");
const models_3 = require("./models");
const db_1 = require("./db");
let server = (0, http_1.createServer)();
let db = (0, db_1.connectDatabase)();
let socket = new socket_io_1.Server(server, {
    path: '/',
    transports: ['websocket'],
    allowUpgrades: true,
    cors: {
        origin: "*"
    }
});
let $usersStore = new ClientStore_1.ClientStore;
socket.on('connection', (connection) => {
    let client = new Client_1.Client(connection);
    //Авторизация
    connection.on(ClientActions_1.default.AUTH, (data) => __awaiter(void 0, void 0, void 0, function* () {
        let user = yield models_1.User.findByPk(data.id);
        user ? onSuccessAuth(user) : onFailureAuth();
    }));
    connection.on(ClientActions_1.default.REGISTER, (data) => __awaiter(void 0, void 0, void 0, function* () {
        let user = yield models_1.User.create({});
        onSuccessAuth(user);
    }));
    function onSuccessAuth(user) {
        client.auth(user);
        connection.emit(ServerActions_1.default.AUTHORIZED, {
            success: true,
            user
        });
        socket.emit(ServerActions_1.default.USER_ONLINE, {
            id: user.id,
            online: true
        });
        //Handlers
        connection.on('disconnect', (data) => {
            $usersStore.remove(client);
            if (!$usersStore.has(user.id)) {
                socket.emit(ServerActions_1.default.USER_ONLINE, {
                    id: user.id,
                    online: false
                });
            }
        });
        connection.on(ClientActions_1.default.SEND_MESSAGE, (data) => {
        });
        connection.on(ClientActions_1.default.DELETE_MESSAGE, (data) => __awaiter(this, void 0, void 0, function* () {
            let message = yield models_2.Message.findByPk(data.id, {
                include: models_3.Chat
            });
            if (message && message.user_id === user.id) {
                yield message.destroy();
                let chat = message.chat;
                let users = yield chat.getUsers();
                $usersStore.filter(users.map(u => u.id)).each((cl) => {
                    cl.socket.emit(ServerActions_1.default.DELETE_MESSAGE, {
                        message,
                        chat
                    });
                });
            }
        }));
        connection.on(ClientActions_1.default.CLEAR_CHAT, (data) => {
        });
        connection.on(ClientActions_1.default.DELETE_CHAT, (data) => {
        });
        connection.on(ClientActions_1.default.GET_HISTORY, (data) => {
        });
    }
    function onFailureAuth() {
        connection.emit(ServerActions_1.default.AUTHORIZED, {
            success: false
        });
    }
});
server.listen(3000);
