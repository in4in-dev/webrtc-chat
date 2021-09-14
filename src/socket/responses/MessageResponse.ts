import {DefaultResponse} from "./DefaultResponse";
import {Chat, Message, Room} from "../../models";

export class MessageResponse extends DefaultResponse{

    constructor(message : Message, chat : Chat, room : Room) {
        super(true, {
            chat,
            room,
            message
        });
    }

}