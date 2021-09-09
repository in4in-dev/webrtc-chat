"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileFactory = exports.FileModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const User_1 = require("./User");
class FileModel extends sequelize_1.Model {
}
exports.FileModel = FileModel;
exports.FileFactory = {
    init: function (db) {
        FileModel.init({
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: sequelize_2.DataTypes.BIGINT
            },
            type: {
                type: sequelize_2.DataTypes.ENUM({
                    values: ['video', 'photo', 'voice', 'file']
                })
            },
            path: {
                type: sequelize_2.DataTypes.STRING,
                allowNull: false
            },
            user_id: {
                type: sequelize_2.DataTypes.BIGINT,
                allowNull: false
            }
        }, {
            sequelize: db,
            modelName: 'file',
            timestamps: true
        });
        return FileModel;
    },
    relations() {
        FileModel.belongsTo(User_1.UserModel);
    }
};
