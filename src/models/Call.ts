import {BelongsToGetAssociationMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {Factory} from "../module/Factory";
import {UserModel} from "./User";

export class CallModel extends Model{

    public id! : number;

    public caller_id! : number;
    public caller? : UserModel;
    public getCaller! : BelongsToGetAssociationMixin<UserModel>;

    public receiver_id! : number;
    public receiver? : UserModel;
    public getReceiver! : BelongsToGetAssociationMixin<UserModel>;

    public created_at! : Date;
    public updated_at! : Date;

    public toJSON(): object {

        let {id, caller_id, receiver_id, created_at} = this;

        return {id, caller_id, receiver_id, created_at};

    }

}

export let CallFactory : Factory = {

    init : function(db : Sequelize) {

        CallModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            receiver_id : {
                type : DataTypes.BIGINT,
                allowNull: false
            },
            caller_id : {
                type : DataTypes.BIGINT,
                allowNull: false
            }
        }, {
            sequelize : db,
            modelName : 'call',
            timestamps : true,
            underscored : true,
            indexes : [
                {
                    fields : ['caller_id']
                },
                {
                    fields : ['receiver_id']
                }
            ]
        });


        return CallModel;

    },

    relations(){

        CallModel.belongsTo(UserModel, {
            foreignKey : 'receiver_id'
        });

        CallModel.belongsTo(UserModel, {
            foreignKey : 'caller_id'
        });

    }

}
