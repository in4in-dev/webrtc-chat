import { ChatModel } from "./Chat";
import { ChatRelationModel } from "./ChatRelation";
import { FileModel } from "./File";
import { MessageModel } from "./Message";
import { UserModel } from "./User";
import { Sequelize } from "sequelize";
export declare function _init_models(db: Sequelize): void;
export { ChatModel as Chat };
export { UserModel as User };
export { ChatRelationModel as ChatRelation };
export { FileModel as File };
export { MessageModel as Message };
