"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.File = exports.ChatRelation = exports.User = exports.Chat = exports._init_models = void 0;
const Chat_1 = require("./Chat");
Object.defineProperty(exports, "Chat", { enumerable: true, get: function () { return Chat_1.ChatModel; } });
const ChatRelation_1 = require("./ChatRelation");
Object.defineProperty(exports, "ChatRelation", { enumerable: true, get: function () { return ChatRelation_1.ChatRelationModel; } });
const File_1 = require("./File");
Object.defineProperty(exports, "File", { enumerable: true, get: function () { return File_1.FileModel; } });
const Message_1 = require("./Message");
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return Message_1.MessageModel; } });
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.UserModel; } });
function _init_models(db) {
    let factories = [User_1.UserFactory, Chat_1.ChatFactory, ChatRelation_1.ChatRelationFactory, File_1.FileFactory, Message_1.MessageFactory];
    factories.forEach(e => e.init(db));
    factories.forEach(e => e.relations(db));
}
exports._init_models = _init_models;
