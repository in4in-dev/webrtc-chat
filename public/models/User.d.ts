import { BelongsToManyGetAssociationsMixin, Model } from "sequelize";
import { ChatModel } from "./Chat";
import { Factory } from "../module/Factory";
export declare class UserModel extends Model {
    id: number;
    chats?: ChatModel[];
    getChats: BelongsToManyGetAssociationsMixin<ChatModel>;
    createdAt: Date;
    updatedAt: Date;
}
export declare let UserFactory: Factory;
