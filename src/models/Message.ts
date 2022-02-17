import {BelongsToGetAssociationMixin, DataTypes, HasOneGetAssociationMixin, Model, Sequelize} from "sequelize";
import {ChatModel} from "./Chat";
import {FileModel} from "./File";
import {UserModel} from "./User";
import {Factory} from "../module/Factory";
import {AttachmentModel} from "./Attachment";
import {RoomModel} from "./Room";
import {Message} from "./index";

export class MessageModel extends Model{
    public id! : number;
    public text! : string;

    public answer_message_id! : number | null;
    public answer_message? : MessageModel;
    public getAnswerMessage! : BelongsToGetAssociationMixin<MessageModel>;

    public room_id! : number;
    public room? : RoomModel;
    public getRoom! : BelongsToGetAssociationMixin<RoomModel>;

    public user_id! : number;
    public user? : UserModel;
    public getUser! : BelongsToGetAssociationMixin<UserModel>;

    public attachment_id! : number | null;
    public attachment? : FileModel | null;
    public getAttachment! : HasOneGetAssociationMixin<FileModel>;

    public created_at! : Date;
    public updated_at! : Date;

    public toJSON(): object {

        let {id, room_id, created_at, updated_at, user_id, text, answer_message_id, answer_message = null, attachment = null} = this;

        return {id, room_id, created_at, updated_at, user_id, text, attachment, answer_message, answer_message_id};

    }

}

export let MessageFactory : Factory = {

    init : function(db : Sequelize) {

        MessageModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            room_id : {
                allowNull : false,
                type : DataTypes.BIGINT
            },
            text : {
                allowNull: true,
                type : DataTypes.TEXT({length : 'long'})
            },
            user_id : {
                allowNull : false,
                type : DataTypes.BIGINT
            },
            attachment_id : {
                allowNull : true,
                type : DataTypes.BIGINT
            },
            answer_message_id : {
                allowNull : true,
                type : DataTypes.BIGINT
            }
        }, {
            sequelize : db,
            modelName: 'message',
            paranoid : true,
            underscored : true,
            timestamps : true,
            indexes : [
                { fields : ['user_id'] },
                { fields : ['answer_message_id'] },
                { fields : ['room_id'] },
                { fields : ['created_at'] }
            ]
        });

        return MessageModel;

    },

    relations(){

        MessageModel.belongsTo(RoomModel, {
            onDelete : 'CASCADE'
        });
        MessageModel.belongsTo(UserModel, {
            onDelete : 'CASCADE'
        });
        MessageModel.belongsTo(AttachmentModel, {
            onDelete : 'SET NULL'
        });
        MessageModel.belongsTo(MessageModel, {
            foreignKey : 'answer_message_id',
            as : 'answer_message',
            onDelete : 'SET NULL'
        });

    }

}


