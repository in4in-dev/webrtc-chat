import {DefaultResponse} from "./DefaultResponse";
import {Chat, Message} from "../models";

export class DeleteMessageResponse extends DefaultResponse{

    constructor(message : Message, chat : Chat) {

        super(true, {

        })

    }

}