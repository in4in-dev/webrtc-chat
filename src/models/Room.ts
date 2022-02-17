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
import {AttachmentModel} from "./Attachment";

export class RoomModel extends Model {
    public id! : number;

    public users? : UserModel[];
    public getUsers!: BelongsToManyGetAssociationsMixin<UserModel>;

    public chats? : ChatModel[];
    public getChats!: HasManyGetAssociationsMixin<ChatModel>;

    public messages? : MessageModel[];
    public getMessages!: BelongsToManyGetAssociationsMixin<MessageModel>;

    public attachments? : AttachmentModel[];
    public getAttachments! : HasManyGetAssociationsMixin<AttachmentModel>;

    public created_at! : Date;
    public updated_at! : Date;

    public toJSON(): object {

        let {id, created_at, users = [], messages = []} = this;

        return {id, created_at, users, message : messages.length ? messages[0] : null};

    }

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

        RoomModel.hasMany(MessageModel);

        RoomModel.hasMany(ChatModel);
        RoomModel.hasMany(AttachmentModel);

        RoomModel.belongsToMany(UserModel, {
            through : ChatModel,
            onDelete : 'CASCADE'
        });

    }

}


