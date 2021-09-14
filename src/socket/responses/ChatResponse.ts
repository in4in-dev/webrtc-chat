import {DefaultResponse} from "./DefaultResponse";
import {Chat, Room} from "../../models";

export class ChatResponse extends DefaultResponse{

    constructor(chat : Chat, room : Room) {
        super(true, {
            chat,
            room,
        });
    }

}