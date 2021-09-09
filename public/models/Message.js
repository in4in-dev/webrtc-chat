"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFactory = exports.MessageModel = void 0;
const sequelize_1 = require("sequelize");
const Chat_1 = require("./Chat");
const User_1 = require("./User");
const Attachment_1 = require("./Attachment");
class MessageModel extends sequelize_1.Model {
}
exports.MessageModel = MessageModel;
exports.MessageFactory = {
    init: function (db) {
        MessageModel.init({
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: sequelize_1.DataTypes.BIGINT
            },
            chat_id: {
                allowNull: false,
                type: sequelize_1.DataTypes.BIGINT
            },
            text: {
                allowNull: true,
                type: sequelize_1.DataTypes.TEXT({ length: 'long' })
            },
            user_id: {
                allowNull: false,
                type: sequelize_1.DataTypes.BIGINT
            },
            attachment_id: {
                allowNull: true,
                type: sequelize_1.DataTypes.BIGINT
            }
        }, {
            sequelize: db,
            modelName: 'message',
            timestamps: true,
            indexes: [
                { fields: ['user_id'] },
                { fields: ['chat_id'] },
                { fields: ['createdAt'] }
            ]
        });
        return MessageModel;
    },
    relations() {
        MessageModel.belongsTo(Chat_1.ChatModel);
        MessageModel.belongsTo(User_1.UserModel);
        MessageModel.hasOne(Attachment_1.AttachmentModel);
    }
};
