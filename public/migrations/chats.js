import { Message } from "../models/Message";
import { DataTypes } from "sequelize";
export default function (db) {
    Message.init({
        user_id: {
            allowNull: false,
            type: DataTypes.BIGINT
        },
    }, { db, modelName: 'user' });
}
