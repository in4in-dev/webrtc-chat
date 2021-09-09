"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatFactory = exports.ChatModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const User_1 = require("./User");
const ChatRelation_1 = require("./ChatRelation");
class ChatModel extends sequelize_1.Model {
}
exports.ChatModel = ChatModel;
exports.ChatFactory = {
    init: function (db) {
        ChatModel.init({
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: sequelize_2.DataTypes.BIGINT
            }
        }, {
            sequelize: db,
            modelName: 'chat',
            timestamps: true,
        });
        return ChatModel;
    },
    relations() {
        ChatModel.belongsToMany(User_1.UserModel, {
            through: ChatRelation_1.ChatRelationModel
        });
    }
};
