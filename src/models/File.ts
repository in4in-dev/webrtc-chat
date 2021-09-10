import {BelongsToGetAssociationMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {UserModel} from "./User";
import {Factory} from "../module/Factory";

export class FileModel extends Model{
    public id! : number;
    public type! : string;
    public path! : string;

    public user_id! : number;
    public user? : UserModel;
    public getUser! : BelongsToGetAssociationMixin<UserModel>;

    public createdAt! : Date;
    public updatedAt! : Date;

}

export let FileFactory : Factory = {

    init : function(db : Sequelize) {

        FileModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            type : {
                type : DataTypes.ENUM({
                    values : ['video', 'photo', 'voice', 'file']
                })
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
            timestamps : true
        });


        return FileModel;

    },

    relations(){

        FileModel.belongsTo(UserModel);

    }

}
