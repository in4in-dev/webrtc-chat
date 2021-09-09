import {BelongsToManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {ChatModel} from "./Chat";
import {ChatRelationModel} from "./ChatRelation";
import {Factory} from "../module/Factory";
import {FileModel} from "./File";
import {MessageModel} from "./Message";

export class UserModel extends Model{
    public id! : number;
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
            }
        }, {
            sequelize : db,
            modelName : 'user',
            timestamps : true
        });

        return UserModel;

    },

    relations() {

        UserModel.belongsToMany(ChatModel, {
            through : ChatRelationModel
        });

    }

}