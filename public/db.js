"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("./models");
function connectDatabase() {
    let db = new sequelize_1.Sequelize('webrtc', 'root', 'root', {
        host: 'localhost',
        dialect: 'mysql'
    });
    (0, models_1._init_models)(db);
    return db;
}
exports.connectDatabase = connectDatabase;
