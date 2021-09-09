import { BelongsToManyGetAssociationsMixin, Model } from "sequelize";
import { UserModel } from "./User";
import { Factory } from "../module/Factory";
export declare class ChatModel extends Model {
    id: number;
    users?: UserModel[];
    getUsers: BelongsToManyGetAssociationsMixin<UserModel>;
    messages?: UserModel[];
    getMessages: BelongsToManyGetAssociationsMixin<UserModel>;
    createdAt: Date;
    updatedAt: Date;
}
export declare let ChatFactory: Factory;
