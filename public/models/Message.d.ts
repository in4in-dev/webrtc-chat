import { BelongsToGetAssociationMixin, HasOneGetAssociationMixin, Model } from "sequelize";
import { ChatModel } from "./Chat";
import { UserModel } from "./User";
import { Factory } from "../module/Factory";
export declare class MessageModel extends Model {
    id: number;
    text: string;
    chat_id: number;
    chat?: ChatModel;
    getChat: BelongsToGetAssociationMixin<ChatModel>;
    user_id: number;
    user?: UserModel;
    getUser: BelongsToGetAssociationMixin<UserModel>;
    file_id: number | null;
    file?: File | null;
    getFile: HasOneGetAssociationMixin<File>;
    createdAt: Date;
    updatedAt: Date;
}
export declare let MessageFactory: Factory;
