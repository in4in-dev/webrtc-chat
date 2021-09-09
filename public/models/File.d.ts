import { BelongsToGetAssociationMixin, Model } from "sequelize";
import { UserModel } from "./User";
import { Factory } from "../module/Factory";
export declare class FileModel extends Model {
    id: number;
    type: string;
    path: string;
    user_id: number;
    user?: UserModel;
    getUser: BelongsToGetAssociationMixin<UserModel>;
    createdAt: Date;
    updatedAt: Date;
}
export declare let FileFactory: Factory;
