import {BelongsToGetAssociationMixin, Model, Sequelize} from "sequelize";
import {DataTypes} from "sequelize";
import {UserModel} from "./User";
import {ChatModel} from "./Chat";
import {Factory} from "../module/Factory";

export class ChatRelationModel extends Model {
    public id! : number;

    public user_id! : number;
    public user? : UserModel;
    public getUser! : BelongsToGetAssociationMixin<UserModel>;

    public chat_id! : number;
    public chat? : ChatModel;
    public getChat! : BelongsToGetAssociationMixin<ChatModel>;

    public clear_time! : Date | null;
    public is_deleted! : boolean;
    public unread_count! : number;

    public createdAt! : Date;
    public updatedAt! : Date;

}

export let ChatRelationFactory : Factory = {

    init : function(db : Sequelize) {

        ChatRelationModel.init({
            id : {
                primaryKey : true,
                autoIncrement : true,
                type : DataTypes.BIGINT
            },
            user_id : {
                allowNull : false,
                type : DataTypes.BIGINT
            },
            chat_id : {
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
            modelName : 'chat_relation',
            timestamps : true,
            indexes : [
                {
                    fields : ['chat_id']
                },
                {
                    fields : ['is_deleted']
                },
                {
                    fields : ['user_id']
                },
                {
                    fields : ['user_id', 'chat_id'],
                    unique : true
                }
            ]
        });

        return ChatRelationModel;

    },

    relations(){

        ChatRelationModel.belongsTo(UserModel);
        ChatRelationModel.belongsTo(ChatModel);

    }

}


