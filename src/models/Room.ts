import {
    BelongsToGetAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    HasManyGetAssociationsMixin,
    Model,
    Sequelize
} from "sequelize";
import {DataTypes} from "sequelize";
import {MessageModel} from "./Message";
import {UserModel} from "./User";
import {Factory} from "../module/Factory";
import {ChatModel} from "./Chat";

export class RoomModel extends Model {
    public id! : number;

    public receivers? : UserModel[];
    public getReceivers!: BelongsToManyGetAssociationsMixin<UserModel>;

    public chats? : ChatModel[];
    public getChats!: HasManyGetAssociationsMixin<ChatModel>;

    public messages? : MessageModel[];
    public getMessages!: BelongsToManyGetAssociationsMixin<MessageModel>;

    public created_at! : Date;
    public updated_at! : Date;

}


export let RoomFactory : Factory = {

    init : function(db : Sequelize) {

        RoomModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            }
        }, {
            sequelize : db,
            modelName : 'room',
            underscored : true,
            timestamps : true,
        });

        return RoomModel;

    },

    relations(){

        RoomModel.hasMany(ChatModel);

        RoomModel.belongsToMany(UserModel, {
            through : ChatModel,
            foreignKey : 'receiver_id'
        });

    }

}


