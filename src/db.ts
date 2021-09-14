import {Sequelize} from "sequelize";
import {_init_models} from "./models";
import {Env} from "./module/Env";

export function connectDatabase() : Sequelize
{

    let db = new Sequelize(
        Env.get('DB_NAME'),
        Env.get('DB_LOGIN'),
        Env.get('DB_PASSWORD'),
        {
            host : Env.get('DB_HOST'),
            dialect : <any>Env.get('DB_DIALECT')
        }
    );

    _init_models(db);

    return db;

}

