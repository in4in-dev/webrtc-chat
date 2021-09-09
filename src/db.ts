import {Sequelize} from "sequelize";
import {_init_models} from "./models";

export function connectDatabase() : Sequelize
{

    let db = new Sequelize('webrtc', 'root', 'root', {
        host : 'localhost',
        dialect : 'mysql'
    });

    _init_models(db);

    return db;

}

