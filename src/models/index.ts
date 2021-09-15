import {ChatFactory, ChatModel} from "./Chat";
import {RoomModel, RoomFactory} from "./Room";
import {FileFactory, FileModel} from "./File";
import {MessageFactory, MessageModel} from "./Message";
import {UserFactory, UserModel} from "./User";
import {Sequelize} from "sequelize";
import {AttachmentFactory, AttachmentModel} from "./Attachment";
import {CallFactory, CallModel} from "./Call";

export function _init_models(db : Sequelize) : void{

    let factories = [UserFactory, ChatFactory, RoomFactory, FileFactory, MessageFactory, AttachmentFactory, CallFactory];

    factories.forEach(e => e.init(db))
    factories.forEach(e => e.relations(db));

}

export {ChatModel as Chat};
export {UserModel as User};
export {RoomModel as Room};
export {FileModel as File};
export {MessageModel as Message};
export {AttachmentModel as Attachment}
export {CallModel as Call}
