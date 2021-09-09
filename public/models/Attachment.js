"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentFactory = exports.AttachmentModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const Chat_1 = require("./Chat");
const File_1 = require("./File");
class AttachmentModel extends sequelize_1.Model {
}
exports.AttachmentModel = AttachmentModel;
exports.AttachmentFactory = {
    init: function (db) {
        AttachmentModel.init({
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: sequelize_2.DataTypes.BIGINT
            },
            file_id: {
                type: sequelize_2.DataTypes.BIGINT,
                allowNull: false
            },
            chat_id: {
                type: sequelize_2.DataTypes.BIGINT,
                allowNull: false
            }
        }, {
            sequelize: db,
            modelName: 'attachment',
            timestamps: true
        });
        return File_1.FileModel;
    },
    relations() {
        AttachmentModel.belongsTo(Chat_1.ChatModel);
        AttachmentModel.hasOne(File_1.FileModel);
    }
};
