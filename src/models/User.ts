import {BelongsToManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {ChatModel} from "./Chat";
import {Factory} from "../module/Factory";

export class UserModel extends Model{
    public id! : number;
    public name! : string;
    public avatar_file_id! : string | null;

    public chats? : ChatModel[];
    public getChats! : BelongsToManyGetAssociationsMixin<ChatModel>;

    public createdAt! : Date;
    public updatedAt! : Date;
}

export let UserFactory : Factory = {

    init: function (db: Sequelize) {

        UserModel.init({
            id : {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.BIGINT
            },
            name : {
                allowNull : false,
                type : DataTypes.STRING
            },
            avatar_file_id : {
                allowNull : true,
                type : DataTypes.BIGINT
            }
        }, {
            sequelize : db,
            modelName : 'user',
            timestamps : true
        });

        return UserModel;

    },

    relations() {

        UserModel.hasMany(ChatModel);

    }

}