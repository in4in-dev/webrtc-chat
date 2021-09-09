import {BelongsToGetAssociationMixin, DataTypes, HasOneGetAssociationMixin, Model, Sequelize} from "sequelize";
import {ChatModel} from "./Chat";
import {FileModel} from "./File";
import {UserModel} from "./User";
import {Factory} from "../module/Factory";
import {AttachmentModel} from "./Attachment";

export class MessageModel extends Model{
    public id! : number;
    public text! : string;

    public chat_id! : number;
    public chat? : ChatModel;
    public getChat! : BelongsToGetAssociationMixin<ChatModel>;

    public user_id! : number;
    public user? : UserModel;
    public getUser! : BelongsToGetAssociationMixin<UserModel>;

    public attachment_id! : number | null;
    public attachment? : File | null;
    public getAttachment! : HasOneGetAssociationMixin<File>;

    public createdAt! : Date;
    public updatedAt! : Date;

}

export let MessageFactory : Factory = {

    init : function(db : Sequelize) {

        MessageModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            chat_id : {
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
            }
        }, {
            sequelize : db,
            modelName: 'message',
            timestamps : true,
            indexes : [
                { fields : ['user_id'] },
                { fields : ['chat_id'] },
                { fields : ['createdAt'] }
            ]
        });

        return MessageModel;

    },

    relations(){

        MessageModel.belongsTo(ChatModel);
        MessageModel.belongsTo(UserModel);
        MessageModel.hasOne(AttachmentModel);

    }

}


