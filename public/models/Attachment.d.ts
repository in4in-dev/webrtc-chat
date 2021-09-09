import { BelongsToGetAssociationMixin, Model } from "sequelize";
import { Factory } from "../module/Factory";
import { ChatModel } from "./Chat";
import { FileModel } from "./File";
export declare class AttachmentModel extends Model {
    id: number;
    file_id: number;
    file?: FileModel;
    getFile: BelongsToGetAssociationMixin<FileModel>;
    chat_id: number;
    chat?: ChatModel;
    getChat: BelongsToGetAssociationMixin<ChatModel>;
    createdAt: Date;
    updatedAt: Date;
}
export declare let AttachmentFactory: Factory;
