import {BelongsToGetAssociationMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {UserModel} from "./User";
import {RoomModel} from "./Room";
import {Factory} from "../module/Factory";

export class ChatModel extends Model {
    public id! : number;

    public user_id! : number;
    public user? : UserModel;
    public getUsers! : BelongsToGetAssociationMixin<UserModel>;

    public room_id! : number;
    public room? : RoomModel;
    public getRoom! : BelongsToGetAssociationMixin<RoomModel>;

    public clear_time! : Date | null;
    public is_deleted! : boolean;
    public unread_count! : number;

    public created_at! : Date;
    public updated_at! : Date;

}

export let ChatFactory : Factory = {

    init : function(db : Sequelize) {

        ChatModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            user_id : {
                allowNull : false,
                type : DataTypes.BIGINT
            },
            room_id : {
                allowNull: false,
                type : DataTypes.BIGINT
            },
            clear_time : {
                allowNull : true,
                defaultValue : null,
                type : DataTypes.DATE
            },
            is_deleted : {
                allowNull : false,
                defaultValue : false,
                type : DataTypes.BOOLEAN
            },
            unread_count : {
                allowNull : false,
                defaultValue : 0,
                type : DataTypes.INTEGER
            }
        }, {
            sequelize : db,
            modelName : 'chat',
            timestamps : true,
            underscored : true,
            indexes : [
                {
                    fields : ['updated_at']
                },
                {
                    fields : ['room_id']
                },
                {
                    fields : ['is_deleted']
                },
                {
                    fields : ['user_id']
                },
                {
                    fields : ['user_id', 'room_id'],
                    unique : true
                }
            ]
        });

        return ChatModel;

    },

    relations(){

        ChatModel.belongsTo(RoomModel);
        ChatModel.belongsTo(UserModel);

    }

}


