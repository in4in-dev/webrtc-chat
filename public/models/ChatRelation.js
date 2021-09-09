"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRelationFactory = exports.ChatRelationModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const User_1 = require("./User");
const Chat_1 = require("./Chat");
class ChatRelationModel extends sequelize_1.Model {
}
exports.ChatRelationModel = ChatRelationModel;
exports.ChatRelationFactory = {
    init: function (db) {
        ChatRelationModel.init({
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: sequelize_2.DataTypes.BIGINT
            },
            user_id: {
                allowNull: false,
                type: sequelize_2.DataTypes.BIGINT
            },
            chat_id: {
                allowNull: false,
                type: sequelize_2.DataTypes.BIGINT
            },
            clear_time: {
                allowNull: true,
                defaultValue: null,
                type: sequelize_2.DataTypes.DATE
            },
            is_deleted: {
                allowNull: false,
                defaultValue: false,
                type: sequelize_2.DataTypes.BOOLEAN
            },
            unread_count: {
                allowNull: false,
                defaultValue: 0,
                type: sequelize_2.DataTypes.INTEGER
            }
        }, {
            sequelize: db,
            modelName: 'chat_relation',
            timestamps: true,
            indexes: [
                {
                    fields: ['chat_id']
                },
                {
                    fields: ['is_deleted']
                },
                {
                    fields: ['user_id']
                },
                {
                    fields: ['user_id', 'chat_id'],
                    unique: true
                }
            ]
        });
        return ChatRelationModel;
    },
    relations() {
        ChatRelationModel.belongsTo(User_1.UserModel);
        ChatRelationModel.belongsTo(Chat_1.ChatModel);
    }
};
