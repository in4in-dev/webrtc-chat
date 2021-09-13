import {BelongsToManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {ChatModel} from "./Chat";
import {Factory} from "../module/Factory";

export class UserModel extends Model{
    public id! : number;

    public chats? : ChatModel[];
    public getChats! : BelongsToManyGetAssociationsMixin<ChatModel>;

    public created_at! : Date;
    public updated_at! : Date;

    public toJSON(): object {

        let {id, created_at} = this;

        return {id, created_at};

    }

}

export let UserFactory : Factory = {

    init: function (db: Sequelize) {

        UserModel.init({
            id : {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.BIGINT
            }
        }, {
            sequelize : db,
            underscored : true,
            modelName : 'user',
            timestamps : true
        });

        return UserModel;

    },

    relations() {

        UserModel.hasMany(ChatModel);

    }

}