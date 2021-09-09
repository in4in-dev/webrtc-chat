import { BelongsToGetAssociationMixin, Model } from "sequelize";
import { UserModel } from "./User";
import { ChatModel } from "./Chat";
import { Factory } from "../module/Factory";
export declare class ChatRelationModel extends Model {
    id: number;
    user_id: number;
    user?: UserModel;
    getUser: BelongsToGetAssociationMixin<UserModel>;
    chat_id: number;
    chat?: ChatModel;
    getChat: BelongsToGetAssociationMixin<UserModel>;
    clear_time: Date | null;
    is_deleted: boolean;
    unread_count: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare let ChatRelationFactory: Factory;
