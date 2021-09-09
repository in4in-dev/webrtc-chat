import {ChatFactory, ChatModel} from "./Chat";
import {ChatRelationFactory, ChatRelationModel} from "./ChatRelation";
import {FileFactory, FileModel} from "./File";
import {MessageFactory, MessageModel} from "./Message";
import {UserFactory, UserModel} from "./User";
import {Sequelize} from "sequelize";
import {AttachmentFactory, AttachmentModel} from "./Attachment";

export function _init_models(db : Sequelize) : void{

    let factories = [UserFactory, ChatFactory, ChatRelationFactory, FileFactory, MessageFactory, AttachmentFactory];

    factories.forEach(e => e.init(db))
    factories.forEach(e => e.relations(db));

}

export {ChatModel as Chat};
export {UserModel as User};
export {ChatRelationModel as ChatRelation};
export {FileModel as File};
export {MessageModel as Message};
export {AttachmentModel as Attachment}
