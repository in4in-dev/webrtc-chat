import {BelongsToGetAssociationMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {UserModel} from "./User";
import {Factory} from "../module/Factory";
import {ChatModel} from "./Chat";
import {ChatRelationModel} from "./ChatRelation";
import {FileModel} from "./File";

export class AttachmentModel extends Model{
    public id! : number;

    public file_id! : number;
    public file? : FileModel;
    public getFile! : BelongsToGetAssociationMixin<FileModel>;

    public chat_id! : number;
    public chat? : ChatModel;
    public getChat! : BelongsToGetAssociationMixin<ChatModel>;

    public createdAt! : Date;
    public updatedAt! : Date;

}

export let AttachmentFactory : Factory = {

    init : function(db : Sequelize) {

        AttachmentModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            file_id : {
                type : DataTypes.BIGINT,
                allowNull: false
            },
            chat_id : {
                type : DataTypes.BIGINT,
                allowNull: false
            }
        }, {
            sequelize : db,
            modelName : 'attachment',
            timestamps : true
        });


        return FileModel;

    },

    relations(){

        AttachmentModel.belongsTo(ChatModel);
        AttachmentModel.hasOne(FileModel);

    }

}
