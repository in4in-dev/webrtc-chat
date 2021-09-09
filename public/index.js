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
const sequelize_1 = require("sequelize");
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
        onSuccessAuth(yield models_1.User.create({}));
    }));
    function onSuccessAuth(user) {
        client.auth(user);
        welcome();
        socket.emit(ServerActions_1.default.USER_ONLINE, {
            id: user.id,
            online: true
        });
        ///////////////////////////////////
        /////// Handlers
        ///////////////////////////////////
        //Отключение
        connection.on('disconnect', (data) => {
            $usersStore.remove(client);
            if (!$usersStore.has(user.id)) {
                socket.emit(ServerActions_1.default.USER_ONLINE, {
                    id: user.id,
                    online: false
                });
            }
        });
        connection.on(ClientActions_1.default.CREATE_CHAT, (data) => __awaiter(this, void 0, void 0, function* () {
            let receiver = yield models_1.User.findByPk(data.id);
            if (receiver) {
                let chats = yield models_1.ChatRelation.findAll({
                    where: {
                        user_id: user.id
                    },
                    attributes: ['id']
                });
                let relation = yield models_1.ChatRelation.findOne({
                    where: {
                        user_id: receiver.id,
                        chat_id: {
                            [sequelize_1.Op.in]: chats.map(r => r.chat_id)
                        }
                    }
                });
                //Get or Create chat
                let chat;
                if (!relation) {
                    chat = yield models_3.Chat.create({
                        name: receiver.name,
                        picture: receiver.avatar_file_id
                    });
                    yield models_1.ChatRelation.create({
                        user_id: receiver.id,
                        chat_id: chat.id
                    });
                    yield models_1.ChatRelation.create({
                        user_id: user.id,
                        chat_id: chat.id
                    });
                }
                else {
                    chat = yield relation.getChat();
                }
                yield sendMessage(chat, data.text, data.file_id);
            }
        }));
        connection.on(ClientActions_1.default.SEND_MESSAGE, (data) => __awaiter(this, void 0, void 0, function* () {
            let relation = yield models_1.ChatRelation.findOne({
                where: {
                    user_id: user.id,
                    chat_id: data.id
                },
                include: models_3.Chat
            });
            if (relation) {
                yield models_1.ChatRelation.update({
                    is_deleted: false,
                    unread_count: (0, sequelize_1.literal)('unread_count + 1')
                }, {
                    where: {
                        chat_id: data.id
                    }
                });
                relation.unread_count = 0;
                yield relation.save();
                yield sendMessage(relation.chat, data.text, data.file_id);
            }
        }));
        //Удаление сообщения
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
        //Очистка истории сообщений
        connection.on(ClientActions_1.default.CLEAR_CHAT, (data) => __awaiter(this, void 0, void 0, function* () {
            let relation = yield models_1.ChatRelation.findOne({
                where: {
                    chat_id: data.id,
                    user_id: user.id
                }
            });
            if (relation) {
                relation.clear_time = new Date;
                yield relation.save();
                $usersStore.filter(user.id).each((cl) => {
                    cl.socket.emit(ServerActions_1.default.CLEAR_CHAT, {
                        id: relation.chat_id
                    });
                });
            }
        }));
        //Удаление чата
        connection.on(ClientActions_1.default.DELETE_CHAT, (data) => __awaiter(this, void 0, void 0, function* () {
            let relation = yield models_1.ChatRelation.findOne({
                where: {
                    chat_id: data.id,
                    user_id: user.id
                }
            });
            if (relation) {
                relation.is_deleted = true;
                yield relation.save();
                $usersStore.filter(user.id).each((cl) => {
                    cl.socket.emit(ServerActions_1.default.DELETE_CHAT, {
                        id: relation.chat_id
                    });
                });
            }
        }));
        //Получение истории
        connection.on(ClientActions_1.default.GET_HISTORY, (data) => __awaiter(this, void 0, void 0, function* () {
            let relation = yield models_1.ChatRelation.findOne({
                where: {
                    chat_id: data.id,
                    user_id: user.id
                }
            });
            if (relation) {
                let filter = {};
                if (data.lastId) {
                    filter.id = {
                        [sequelize_1.Op.lt]: data.last
                    };
                }
                let messages = yield models_2.Message.findAll({
                    where: Object.assign(Object.assign({}, filter), { chat_id: relation.chat_id, createdAt: {
                            [sequelize_1.Op.gt]: relation.clear_time
                        } }),
                    order: [
                        ['id', 'DESC']
                    ],
                    include: models_1.File,
                    limit: Math.min(30, data.limit || 0)
                });
                connection.emit(ServerActions_1.default.HISTORY_LOADED, { messages });
            }
        }));
        //Пометка прочитанными
        connection.on(ClientActions_1.default.READ_CHAT, (data) => __awaiter(this, void 0, void 0, function* () {
            let relation = yield models_1.ChatRelation.findOne({
                where: {
                    chat_id: data.id,
                    user_id: user.id
                },
                include: models_3.Chat
            });
            if (relation) {
                relation.unread_count = 0;
                yield relation.save();
                let chat = relation.chat;
                let users = yield chat.getUsers();
                $usersStore.filter(users.map(u => u.id)).each((cl) => {
                    cl.socket.emit(ServerActions_1.default.READ_CHAT, {
                        chat,
                        unread: relation.unread_count
                    });
                });
            }
        }));
        function sendMessage(chat, text, file_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let attachment = null;
                if (file_id) {
                    let file = yield models_1.File.findByPk(file_id);
                    if (file && file.user_id === user.id) {
                        attachment = yield models_1.Attachment.create({
                            file_id: file.id,
                            chat_id: chat.id
                        });
                    }
                    else {
                        file_id = null;
                    }
                }
                let message = yield models_2.Message.create({
                    attachment_id: attachment === null || attachment === void 0 ? void 0 : attachment.id,
                    text,
                    chat_id: chat.id
                });
                let users = yield chat.getUsers();
                $usersStore.filter(users.map(u => u.id)).each((c) => {
                    c.socket.emit(ServerActions_1.default.NEW_MESSAGE, {
                        chat,
                        message,
                        users
                    });
                });
            });
        }
        function welcome() {
            return __awaiter(this, void 0, void 0, function* () {
                let chats = yield user.getChats({
                    include: models_1.User
                });
                connection.emit(ServerActions_1.default.AUTHORIZED, {
                    success: true,
                    user,
                    chats
                });
            });
        }
    }
    function onFailureAuth() {
        connection.emit(ServerActions_1.default.AUTHORIZED, {
            success: false
        });
    }
});
server.listen(3000);
