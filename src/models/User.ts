import {BelongsToManyGetAssociationsMixin, HasManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {ChatModel} from "./Chat";
import {Factory} from "../module/Factory";
import {FileModel} from "./File";

export class UserModel extends Model{
    public id! : number;
    public token! : string;

    public chats? : ChatModel[];
    public getChats! : BelongsToManyGetAssociationsMixin<ChatModel>;

    public files? : FileModel[];
    public getFiles! : HasManyGetAssociationsMixin<FileModel>;

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
            },
            token : {
                allowNull : true,
                defaultValue : null,
                type : DataTypes.STRING,
                unique : true
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

        UserModel.hasMany(FileModel);
        UserModel.hasMany(ChatModel);

    }

}