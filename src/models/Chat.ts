import {BelongsToManyGetAssociationsMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {MessageModel} from "./Message";
import {UserModel} from "./User";
import {ChatRelationModel} from "./ChatRelation";
import {Factory} from "../module/Factory";

export class ChatModel extends Model {
    public id! : number;

    public users? : UserModel[];
    public getUsers!: BelongsToManyGetAssociationsMixin<UserModel>;

    public messages? : UserModel[];
    public getMessages!: BelongsToManyGetAssociationsMixin<UserModel>;

    public createdAt! : Date;
    public updatedAt! : Date;

}


export let ChatFactory : Factory = {

    init : function(db : Sequelize) {

        ChatModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            }
        }, {
            sequelize : db,
            modelName : 'chat',
            timestamps : true,
        });

        return ChatModel;

    },

    relations(){

        ChatModel.belongsToMany(UserModel, {
            through : ChatRelationModel
        });

    }

}


