import {BelongsToGetAssociationMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {Factory} from "../module/Factory";
import {FileModel} from "./File";
import {RoomModel} from "./Room";

export class AttachmentModel extends Model{

    public id! : number;

    public type! : string;

    public file_id! : number;
    public file? : FileModel;
    public getFile! : BelongsToGetAssociationMixin<FileModel>;

    public room_id! : number;
    public room? : RoomModel;
    public getRoom! : BelongsToGetAssociationMixin<RoomModel>;

    public created_at! : Date;
    public updated_at! : Date;

    public toJSON(): object {

        let {id, type, file_id, created_at, room_id} = this;

        return {id, type, file_id, created_at, room_id};

    }

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
            room_id : {
                type : DataTypes.BIGINT,
                allowNull: false
            },
            type : {
                type : DataTypes.ENUM({
                    values : ['video', 'photo', 'voice', 'file']
                })
            }
        }, {
            sequelize : db,
            modelName : 'attachment',
            timestamps : true,
            underscored : true,
            indexes : [
                {
                    fields : ['room_id']
                }
            ]
        });


        return AttachmentModel;

    },

    relations(){

        AttachmentModel.belongsTo(RoomModel);
        AttachmentModel.belongsTo(FileModel);

    }

}
