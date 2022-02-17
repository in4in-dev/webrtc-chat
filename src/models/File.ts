import {BelongsToGetAssociationMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {UserModel} from "./User";
import {Factory} from "../module/Factory";
import {AttachmentModel} from "./Attachment";

export class FileModel extends Model{
    public id! : number;
    public path! : string;

    public user_id! : number;
    public user? : UserModel;
    public getUser! : BelongsToGetAssociationMixin<UserModel>;

    public created_at! : Date;
    public updated_at! : Date;

    public toJSON(): object {

        let {id, user_id, created_at} = this;

        return { id, user_id, created_at }

    }

}

export let FileFactory : Factory = {

    init : function(db : Sequelize) {

        FileModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            path : {
                type : DataTypes.STRING,
                allowNull : false
            },
            user_id : {
                type : DataTypes.BIGINT,
                allowNull: false
            }
        }, {
            sequelize : db,
            modelName : 'file',
            underscored : true,
            timestamps : true
        });


        return FileModel;

    },

    relations(){

        FileModel.belongsTo(UserModel, {
            onDelete : 'CASCADE'
        });

    }

}
