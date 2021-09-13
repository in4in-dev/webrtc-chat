import {DefaultResponse} from "./DefaultResponse";
import {Chat, Message, Room} from "../models";

export class HistoryResponse extends DefaultResponse{

    constructor(room : Room, chat : Chat, messages : Message[]) {
        super(true, {
            messages
        });
    }

}