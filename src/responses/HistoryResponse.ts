import {DefaultResponse} from "./DefaultResponse";
import {Chat, Message, Room} from "../models";

export class HistoryResponse extends DefaultResponse{

    constructor(messages : Message[]) {
        super(true, {
            messages
        });
    }

}