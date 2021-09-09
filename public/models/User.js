"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = exports.UserModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const Chat_1 = require("./Chat");
const ChatRelation_1 = require("./ChatRelation");
const File_1 = require("./File");
class UserModel extends sequelize_1.Model {
}
exports.UserModel = UserModel;
exports.UserFactory = {
    init: function (db) {
        UserModel.init({
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: sequelize_2.DataTypes.BIGINT
            },
            name: {
                allowNull: false,
                type: sequelize_2.DataTypes.STRING
            },
            avatar_file_id: {
                allowNull: true,
                type: sequelize_2.DataTypes.BIGINT
            }
        }, {
            sequelize: db,
            modelName: 'user',
            timestamps: true
        });
        return UserModel;
    },
    relations() {
        UserModel.belongsToMany(Chat_1.ChatModel, {
            through: ChatRelation_1.ChatRelationModel
        });
        UserModel.hasOne(File_1.FileModel, {
            foreignKey: 'avatar_file_id'
        });
    }
};
