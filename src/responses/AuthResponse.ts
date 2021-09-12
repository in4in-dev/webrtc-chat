import {DefaultResponse} from "./DefaultResponse";
import {Chat, Message, Room, User} from "../models";

export class AuthResponse extends DefaultResponse{

    constructor(user : User | false, chats : any[] = []) {
        super(!!user, {
            user,
            chats
        });
    }

}